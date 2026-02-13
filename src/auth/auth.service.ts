import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { Role } from '@prisma/client';
import { randomUUID } from 'crypto';

type PhoneInput = { telephone: string; isPhonePrincipal?: boolean };

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  private accessTtlSeconds() {
    return Number(this.config.get('ACCESS_TOKEN_TTL_SECONDS') ?? 900);
  }
  private refreshTtlDays() {
    return Number(this.config.get('REFRESH_TOKEN_TTL_DAYS') ?? 30);
  }

  // -------------------------
  // REGISTER
  // -------------------------
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
    const exists = await this.prisma.utilisateur.findUnique({
      where: { email: input.email },
    });
    if (exists) throw new ForbiddenException('Email déjà utilisé');

    const passwordHash = await argon2.hash(input.password);
    const telephones = this.normalizeTelephones(input.telephones);
    const profilCompleted =
      !!input.nom.trim() &&
      !!input.prenom.trim() &&
      !!input.photo?.trim() &&
      !!input.paysId?.trim() &&
      !!input.ville?.trim() &&
      !!input.adresse?.trim() &&
      !!input.resume?.trim() &&
      input.anneesExperience !== undefined;

    const user = await this.prisma.$transaction(async (tx) => {
      const u = await tx.utilisateur.create({
        data: {
          email: input.email,
          passwordHash,
          role: Role.CANDIDAT,
        },
        select: { id: true, email: true, role: true },
      });

      await tx.profilCandidat.create({
        data: {
          utilisateurId: u.id,
          nom: input.nom,
          prenom: input.prenom,
          photo: input.photo,
          paysId: input.paysId,
          ville: input.ville,
          adresse: input.adresse,
          resume: input.resume,
          anneesExperience: input.anneesExperience,
          profilCompleted,
        },
      });

      if (telephones.length > 0) {
        await tx.telephoneCandidat.createMany({
          data: telephones.map((phone) => ({
            candidatId: u.id,
            telephone: phone.telephone,
            isPhonePrincipal: phone.isPhonePrincipal ?? false,
          })),
        });
      }

      return u;
    });

    return user;
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
    const exists = await this.prisma.utilisateur.findUnique({
      where: { email: input.email },
    });
    if (exists) throw new ForbiddenException('Email déjà utilisé');

    const passwordHash = await argon2.hash(input.password);
    const telephones = this.normalizeTelephones(input.telephones);

    const profilCompleted =
      !!input.nom.trim() &&
      !!input.prenom.trim() &&
      !!input.photo?.trim() &&
      !!input.fonction?.trim() &&
      !!input.entrepriseId?.trim();

    const user = await this.prisma.$transaction(async (tx) => {
      const entreprise = await tx.entreprise.findUnique({
        where: { id: input.entrepriseId },
      });
      if (!entreprise) throw new ForbiddenException('Entreprise inexistante');

      const u = await tx.utilisateur.create({
        data: {
          email: input.email,
          passwordHash,
          role: Role.RECRUTEUR,
        },
        select: { id: true, email: true, role: true },
      });

      await tx.profilRecruteur.create({
        data: {
          nom: input.nom,
          prenom: input.prenom,
          fonction: input.fonction,
          utilisateurId: u.id,
          entrepriseId: entreprise.id,
          verifie: profilCompleted,
        },
      });

      if (telephones.length > 0) {
        await tx.telephoneRecruteur.createMany({
          data: telephones.map((phone) => ({
            recruteurId: u.id,
            telephone: phone.telephone,
            isPhonePrincipal: phone.isPhonePrincipal ?? false,
          })),
        });
      }

      return u;
    });

    return user;
  }

  // -------------------------
  // LOGIN / REFRESH / LOGOUT
  // -------------------------
  async login(
    email: string,
    password: string,
    meta: { ip?: string; userAgent?: string },
  ) {
    const user = await this.prisma.utilisateur.findUnique({ where: { email } });
    if (!user || !user.isActive)
      throw new UnauthorizedException('Identifiants invalides');

    const ok = await argon2.verify(user.passwordHash, password);
    if (!ok) throw new UnauthorizedException('Identifiants invalides');

    const refreshExpiresAt = new Date(
      Date.now() + this.refreshTtlDays() * 24 * 60 * 60 * 1000,
    );

    const session = await this.prisma.authSession.create({
      data: {
        userId: user.id,
        refreshTokenHash: 'temp',
        expiresAt: refreshExpiresAt,
        ip: meta.ip,
        userAgent: meta.userAgent,
      },
      select: { id: true },
    });

    // 2) tokens
    const { accessToken, refreshToken } = await this.signTokens(
      user.id,
      user.role,
      session.id,
    );

    // 3) store hash refresh
    await this.prisma.authSession.update({
      where: { id: session.id },
      data: { refreshTokenHash: await argon2.hash(refreshToken) },
    });

    return { userId: user.id, role: user.role, accessToken, refreshToken };
  }

  async refresh(
    refreshToken: string,
    meta: { ip?: string; userAgent?: string },
  ) {
    let payload: any;
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      payload = await this.jwt.verifyAsync(refreshToken, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Refresh token invalide');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const userId = payload.sub as string;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const sessionId = payload.sid as string;
    const session = await this.prisma.authSession.findUnique({
      where: { id: sessionId },
    });
    if (!session || session.userId !== userId)
      throw new UnauthorizedException('Session invalide');
    if (session.revokedAt) throw new UnauthorizedException('Session révoquée');
    if (session.expiresAt <= new Date())
      throw new UnauthorizedException('Session expirée');

    const ok = await argon2.verify(session.refreshTokenHash, refreshToken);
    if (!ok) {
      // refresh réutilisé / volé => on révoque toutes les sessions
      await this.prisma.authSession.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      throw new UnauthorizedException(
        'Refresh token réutilisé. Sessions révoquées.',
      );
    }

    const user = await this.prisma.utilisateur.findUnique({
      where: { id: userId },
    });
    if (!user || !user.isActive)
      throw new UnauthorizedException('Utilisateur invalide');

    // rotation
    const tokens = await this.signTokens(user.id, user.role, sessionId);

    await this.prisma.authSession.update({
      where: { id: sessionId },
      data: {
        refreshTokenHash: await argon2.hash(tokens.refreshToken),
        ip: meta.ip,
        userAgent: meta.userAgent,
      },
    });

    return { userId: user.id, role: user.role, ...tokens };
  }

  private normalizeTelephones(telephones?: PhoneInput[]) {
    if (!telephones || telephones.length === 0) return [];
    const principalCount = telephones.filter((t) => t.isPhonePrincipal).length;
    if (principalCount > 1) {
      throw new BadRequestException('Un seul téléphone principal est autorisé');
    }
    return telephones;
  }

  async logout(accessPayload: {
    sub: string;
    jti: string;
    sid: string;
    exp: number;
  }) {
    // blacklist access
    await this.prisma.revokedAccessToken
      .create({
        data: {
          jti: accessPayload.jti,
          userId: accessPayload.sub,
          expiresAt: new Date(accessPayload.exp * 1000),
        },
      })
      .catch(() => {});

    // révoquer session refresh (device courant)
    await this.prisma.authSession.updateMany({
      where: {
        id: accessPayload.sid,
        userId: accessPayload.sub,
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });

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
