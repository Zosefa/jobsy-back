import type { TelephoneCandidat } from '@prisma/client';

export type CreateTelephoneCandidatInput = {
  candidatId: string;
  telephone: string;
  isPhonePrincipal: boolean;
};

export type UpdateTelephoneCandidatInput = {
  telephone?: string;
  isPhonePrincipal?: boolean;
};

export interface TelephoneCandidatRepository {
  listByUser(userId: string): Promise<TelephoneCandidat[]>;
  findById(id: string): Promise<TelephoneCandidat | null>;
  create(data: CreateTelephoneCandidatInput): Promise<TelephoneCandidat>;
  update(id: string, data: UpdateTelephoneCandidatInput): Promise<TelephoneCandidat>;
  remove(id: string): Promise<TelephoneCandidat>;
  clearPrimary(userId: string): Promise<void>;
  createWithPrimary(userId: string, telephone: string): Promise<TelephoneCandidat>;
  updateWithPrimary(
    userId: string,
    id: string,
    data: UpdateTelephoneCandidatInput,
  ): Promise<TelephoneCandidat>;
  hasProfile(userId: string): Promise<boolean>;
}

export const TELEPHONE_CANDIDAT_REPOSITORY = Symbol(
  'TELEPHONE_CANDIDAT_REPOSITORY',
);
