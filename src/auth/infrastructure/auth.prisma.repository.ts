import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Role } from '@prisma/client';
import {
  AuthRepository,
  CreateCandidatUserInput,
  CreateRecruteurUserInput,
  CreateSessionInput,
} from '../domain/auth.repository';

@Injectable()
export class AuthPrismaRepository implements AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  findUserByEmail(email: string) {
    return this.prisma.utilisateur.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        role: true,
        passwordHash: true,
        isActive: true,
        codeResetMdp: true,
        codeResetMdpExpiration: true,
      },
    });
  }

  findUserById(id: string) {
    return this.prisma.utilisateur.findUnique({
      where: { id },
      select: { id: true, role: true, isActive: true },
    });
  }

  async findUserNamesById(id: string) {
    const user = await this.prisma.utilisateur.findUnique({
      where: { id },
      select: {
        profilCandidat: { select: { nom: true, prenom: true } },
        profilRecruteur: { select: { nom: true, prenom: true } },
        profilAdmin: { select: { nom: true, prenom: true } },
      },
    });

    if (!user) return null;

    return (
      user.profilCandidat ??
      user.profilRecruteur ??
      user.profilAdmin ??
      null
    );
  }

  findEntrepriseById(id: string) {
    return this.prisma.entreprise.findUnique({
      where: { id },
      select: { id: true },
    });
  }

  async updateResetCode(userId: string, codeHash: string, expiresAt: Date) {
    await this.prisma.utilisateur.update({
      where: { id: userId },
      data: {
        codeResetMdp: codeHash,
        codeResetMdpExpiration: expiresAt,
      },
    });
  }

  async clearResetCode(userId: string) {
    await this.prisma.utilisateur.update({
      where: { id: userId },
      data: {
        codeResetMdp: null,
        codeResetMdpExpiration: null,
      },
    });
  }

  async updatePassword(userId: string, passwordHash: string) {
    await this.prisma.utilisateur.update({
      where: { id: userId },
      data: {
        passwordHash,
        codeResetMdp: null,
        codeResetMdpExpiration: null,
      },
    });
  }

  createCandidatUser(input: CreateCandidatUserInput) {
    return this.prisma.$transaction(async (tx) => {
      const u = await tx.utilisateur.create({
        data: {
          email: input.email,
          passwordHash: input.passwordHash,
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
          profilCompleted: input.profilCompleted,
        },
      });

      if (input.telephones.length > 0) {
        await tx.telephoneCandidat.createMany({
          data: input.telephones.map((phone) => ({
            candidatId: u.id,
            telephone: phone.telephone,
            isPhonePrincipal: phone.isPhonePrincipal ?? false,
          })),
        });
      }

      return u;
    });
  }

  createRecruteurUser(input: CreateRecruteurUserInput) {
    return this.prisma.$transaction(async (tx) => {
      const u = await tx.utilisateur.create({
        data: {
          email: input.email,
          passwordHash: input.passwordHash,
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
          entrepriseId: input.entrepriseId,
          photo: input.photo,
          verifie: input.verifie,
        },
      });

      if (input.telephones.length > 0) {
        await tx.telephoneRecruteur.createMany({
          data: input.telephones.map((phone) => ({
            recruteurId: u.id,
            telephone: phone.telephone,
            isPhonePrincipal: phone.isPhonePrincipal ?? false,
          })),
        });
      }

      return u;
    });
  }

  createSession(input: CreateSessionInput) {
    return this.prisma.authSession.create({
      data: {
        userId: input.userId,
        refreshTokenHash: input.refreshTokenHash,
        expiresAt: input.expiresAt,
        ip: input.ip,
        userAgent: input.userAgent,
      },
      select: { id: true },
    });
  }

  async updateSessionRefreshHash(
    sessionId: string,
    refreshTokenHash: string,
    meta?: { ip?: string; userAgent?: string },
  ) {
    await this.prisma.authSession.update({
      where: { id: sessionId },
      data: {
        refreshTokenHash,
        ip: meta?.ip,
        userAgent: meta?.userAgent,
      },
    });
  }

  findSessionById(sessionId: string) {
    return this.prisma.authSession.findUnique({ where: { id: sessionId } });
  }

  async revokeSessionsForUser(userId: string) {
    await this.prisma.authSession.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async revokeSession(userId: string, sessionId: string) {
    await this.prisma.authSession.updateMany({
      where: { id: sessionId, userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAccessToken(input: {
    jti: string;
    userId: string;
    expiresAt: Date;
  }) {
    await this.prisma.revokedAccessToken.create({ data: input });
  }

  findRevokedAccessToken(jti: string) {
    return this.prisma.revokedAccessToken.findUnique({ where: { jti } });
  }
}
