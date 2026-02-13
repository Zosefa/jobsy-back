import type { ProfilRecruteur } from '@prisma/client';

export type UpdateProfilRecruteurInput = {
  nom?: string;
  prenom?: string;
  photo?: string;
  fonction?: string;
  verifie?: boolean;
};

export type ProfilRecruteurTelephoneInput = {
  telephone: string;
  isPhonePrincipal?: boolean;
};

export interface ProfilRecruteurRepository {
  findByUserId(userId: string): Promise<ProfilRecruteur | null>;
  updateByUserId(
    userId: string,
    data: UpdateProfilRecruteurInput,
  ): Promise<ProfilRecruteur>;
  replaceTelephones(
    userId: string,
    telephones: ProfilRecruteurTelephoneInput[],
  ): Promise<void>;
}

export const PROFIL_RECRUTEUR_REPOSITORY = Symbol(
  'PROFIL_RECRUTEUR_REPOSITORY',
);
