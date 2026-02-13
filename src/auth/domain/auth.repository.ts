import type { AuthSession, Entreprise, RevokedAccessToken, Utilisateur } from '@prisma/client';
import type { PhoneInput } from './auth.domain.service';

export type AuthUser = Pick<
  Utilisateur,
  'id' | 'email' | 'role' | 'passwordHash' | 'isActive'
>;

export type PublicUser = Pick<Utilisateur, 'id' | 'email' | 'role'>;

export type CreateCandidatUserInput = {
  email: string;
  passwordHash: string;
  nom: string;
  prenom: string;
  paysId: string;
  ville?: string;
  adresse?: string;
  resume?: string;
  anneesExperience?: number;
  photo?: string;
  profilCompleted: boolean;
  telephones: PhoneInput[];
};

export type CreateRecruteurUserInput = {
  email: string;
  passwordHash: string;
  entrepriseId: string;
  nom: string;
  prenom: string;
  fonction?: string;
  photo?: string;
  verifie: boolean;
  telephones: PhoneInput[];
};

export type CreateSessionInput = {
  userId: string;
  refreshTokenHash: string;
  expiresAt: Date;
  ip?: string;
  userAgent?: string;
};

export interface AuthRepository {
  findUserByEmail(email: string): Promise<AuthUser | null>;
  findUserById(id: string): Promise<Pick<AuthUser, 'id' | 'role' | 'isActive'> | null>;
  findEntrepriseById(id: string): Promise<Pick<Entreprise, 'id'> | null>;
  createCandidatUser(input: CreateCandidatUserInput): Promise<PublicUser>;
  createRecruteurUser(input: CreateRecruteurUserInput): Promise<PublicUser>;
  createSession(input: CreateSessionInput): Promise<Pick<AuthSession, 'id'>>;
  updateSessionRefreshHash(
    sessionId: string,
    refreshTokenHash: string,
    meta?: { ip?: string; userAgent?: string },
  ): Promise<void>;
  findSessionById(sessionId: string): Promise<AuthSession | null>;
  revokeSessionsForUser(userId: string): Promise<void>;
  revokeSession(userId: string, sessionId: string): Promise<void>;
  revokeAccessToken(input: {
    jti: string;
    userId: string;
    expiresAt: Date;
  }): Promise<void>;
  findRevokedAccessToken(jti: string): Promise<RevokedAccessToken | null>;
}

export const AUTH_REPOSITORY = Symbol('AUTH_REPOSITORY');
