import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { randomUUID } from 'node:crypto';
import { Role } from '@prisma/client';
import {
  AUTH_REPOSITORY,
  CreateCandidatUserInput,
  CreateRecruteurUserInput,
} from '../domain/auth.repository';
import type { AuthRepository } from '../domain/auth.repository';
import {
  AuthDomainService,
  PhoneInput,
} from '../domain/auth.domain.service';

@Injectable()
export class AuthAppService {
  constructor(
    @Inject(AUTH_REPOSITORY) private readonly repo: AuthRepository,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly domain: AuthDomainService,
  ) {}

  private accessTtlSeconds() {
    return Number(this.config.get('ACCESS_TOKEN_TTL_SECONDS') ?? 900);
  }
  private refreshTtlDays() {
    return Number(this.config.get('REFRESH_TOKEN_TTL_DAYS') ?? 30);
  }

  async registerCandidat(input: {
    email: string;
    password: string;
    nom: string;
    prenom: string;
    paysId: string;
    ville?: string;
    adresse?: string;
    resume?: string;
    anneesExperience?: number;
    photo?: string;
    telephones?: PhoneInput[];
  }) {
    const exists = await this.repo.findUserByEmail(input.email);
    if (exists) throw new ForbiddenException('Email déjà utilisé');

    const telephones = input.telephones ?? [];
    const principalCount = this.domain.countPrimaryPhones(telephones);
    if (principalCount > 1) {
      throw new BadRequestException('Un seul téléphone principal est autorisé');
    }

    const passwordHash = await argon2.hash(input.password);
    const profilCompleted = this.domain.isCandidatProfilComplete({
      nom: input.nom,
      prenom: input.prenom,
      photo: input.photo,
      paysId: input.paysId,
      ville: input.ville,
      adresse: input.adresse,
      resume: input.resume,
      anneesExperience: input.anneesExperience,
    });

    const payload: CreateCandidatUserInput = {
      email: input.email,
      passwordHash,
      nom: input.nom,
      prenom: input.prenom,
      paysId: input.paysId,
      ville: input.ville,
      adresse: input.adresse,
      resume: input.resume,
      anneesExperience: input.anneesExperience,
      photo: input.photo,
      profilCompleted,
      telephones,
    };

    return this.repo.createCandidatUser(payload);
  }

  async registerRecruteur(input: {
    email: string;
    password: string;
    entrepriseId: string;
    nom: string;
    prenom: string;
    fonction?: string;
    photo?: string;
    telephones?: PhoneInput[];
  }) {
    const exists = await this.repo.findUserByEmail(input.email);
    if (exists) throw new ForbiddenException('Email déjà utilisé');

    const entreprise = await this.repo.findEntrepriseById(input.entrepriseId);
    if (!entreprise) throw new ForbiddenException('Entreprise inexistante');

    const telephones = input.telephones ?? [];
    const principalCount = this.domain.countPrimaryPhones(telephones);
    if (principalCount > 1) {
      throw new BadRequestException('Un seul téléphone principal est autorisé');
    }

    const passwordHash = await argon2.hash(input.password);
    const verifie = this.domain.isRecruteurProfilComplete({
      nom: input.nom,
      prenom: input.prenom,
      photo: input.photo,
      fonction: input.fonction,
      entrepriseId: input.entrepriseId,
    });

    const payload: CreateRecruteurUserInput = {
      email: input.email,
      passwordHash,
      entrepriseId: input.entrepriseId,
      nom: input.nom,
      prenom: input.prenom,
      fonction: input.fonction,
      photo: input.photo,
      verifie,
      telephones,
    };

    return this.repo.createRecruteurUser(payload);
  }

  async login(
    email: string,
    password: string,
    meta: { ip?: string; userAgent?: string },
  ) {
    const user = await this.repo.findUserByEmail(email);
    if (!user || !user.isActive)
      throw new UnauthorizedException('Identifiants invalides');

    const ok = await argon2.verify(user.passwordHash, password);
    if (!ok) throw new UnauthorizedException('Identifiants invalides');

    const refreshExpiresAt = new Date(
      Date.now() + this.refreshTtlDays() * 24 * 60 * 60 * 1000,
    );

    const session = await this.repo.createSession({
      userId: user.id,
      refreshTokenHash: 'temp',
      expiresAt: refreshExpiresAt,
      ip: meta.ip,
      userAgent: meta.userAgent,
    });

    const { accessToken, refreshToken } = await this.signTokens(
      user.id,
      user.role,
      session.id,
    );

    await this.repo.updateSessionRefreshHash(
      session.id,
      await argon2.hash(refreshToken),
    );

    return { userId: user.id, role: user.role, accessToken, refreshToken };
  }

  async refresh(
    refreshToken: string,
    meta: { ip?: string; userAgent?: string },
  ) {
    let payload: any;
    try {
      payload = await this.jwt.verifyAsync(refreshToken, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Refresh token invalide');
    }

    const userId = payload.sub as string;
    const sessionId = payload.sid as string;
    const session = await this.repo.findSessionById(sessionId);
    if (!session || session.userId !== userId)
      throw new UnauthorizedException('Session invalide');
    if (session.revokedAt) throw new UnauthorizedException('Session révoquée');
    if (session.expiresAt <= new Date())
      throw new UnauthorizedException('Session expirée');

    const ok = await argon2.verify(session.refreshTokenHash, refreshToken);
    if (!ok) {
      await this.repo.revokeSessionsForUser(userId);
      throw new UnauthorizedException(
        'Refresh token réutilisé. Sessions révoquées.',
      );
    }

    const user = await this.repo.findUserById(userId);
    if (!user || !user.isActive)
      throw new UnauthorizedException('Utilisateur invalide');

    const tokens = await this.signTokens(user.id, user.role, sessionId);

    await this.repo.updateSessionRefreshHash(
      sessionId,
      await argon2.hash(tokens.refreshToken),
      meta,
    );

    return { userId: user.id, role: user.role, ...tokens };
  }

  async logout(accessPayload: {
    sub: string;
    jti: string;
    sid: string;
    exp: number;
  }) {
    await this.repo
      .revokeAccessToken({
        jti: accessPayload.jti,
        userId: accessPayload.sub,
        expiresAt: new Date(accessPayload.exp * 1000),
      })
      .catch(() => undefined);

    await this.repo.revokeSession(accessPayload.sub, accessPayload.sid);

    return { ok: true };
  }

  private async signTokens(userId: string, role: Role, sessionId: string) {
    const accessJti = randomUUID();
    const refreshJti = randomUUID();

    const accessToken = await this.jwt.signAsync(
      { sub: userId, role, sid: sessionId, jti: accessJti },
      {
        secret: this.config.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: `${this.accessTtlSeconds()}s`,
      },
    );

    const refreshToken = await this.jwt.signAsync(
      { sub: userId, role, sid: sessionId, jti: refreshJti },
      {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: `${this.refreshTtlDays()}d`,
      },
    );

    return { accessToken, refreshToken };
  }
}
