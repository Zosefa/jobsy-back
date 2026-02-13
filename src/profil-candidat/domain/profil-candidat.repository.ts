import type { ProfilCandidat } from '@prisma/client';

export type UpdateProfilCandidatInput = {
  nom?: string;
  prenom?: string;
  photo?: string;
  paysId?: string;
  ville?: string;
  adresse?: string;
  resume?: string;
  anneesExperience?: number;
  profilCompleted?: boolean;
};

export type ProfilCandidatTelephoneInput = {
  telephone: string;
  isPhonePrincipal?: boolean;
};

export interface ProfilCandidatRepository {
  findByUserId(userId: string): Promise<ProfilCandidat | null>;
  updateByUserId(
    userId: string,
    data: UpdateProfilCandidatInput,
  ): Promise<ProfilCandidat>;
  replaceTelephones(
    userId: string,
    telephones: ProfilCandidatTelephoneInput[],
  ): Promise<void>;
}

export const PROFIL_CANDIDAT_REPOSITORY = Symbol(
  'PROFIL_CANDIDAT_REPOSITORY',
);
