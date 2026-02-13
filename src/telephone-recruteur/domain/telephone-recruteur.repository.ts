import type { TelephoneRecruteur } from '@prisma/client';

export type CreateTelephoneRecruteurInput = {
  recruteurId: string;
  telephone: string;
  isPhonePrincipal: boolean;
};

export type UpdateTelephoneRecruteurInput = {
  telephone?: string;
  isPhonePrincipal?: boolean;
};

export interface TelephoneRecruteurRepository {
  listByUser(userId: string): Promise<TelephoneRecruteur[]>;
  findById(id: string): Promise<TelephoneRecruteur | null>;
  create(data: CreateTelephoneRecruteurInput): Promise<TelephoneRecruteur>;
  update(id: string, data: UpdateTelephoneRecruteurInput): Promise<TelephoneRecruteur>;
  remove(id: string): Promise<TelephoneRecruteur>;
  clearPrimary(userId: string): Promise<void>;
  createWithPrimary(userId: string, telephone: string): Promise<TelephoneRecruteur>;
  updateWithPrimary(
    userId: string,
    id: string,
    data: UpdateTelephoneRecruteurInput,
  ): Promise<TelephoneRecruteur>;
  hasProfile(userId: string): Promise<boolean>;
}

export const TELEPHONE_RECRUTEUR_REPOSITORY = Symbol(
  'TELEPHONE_RECRUTEUR_REPOSITORY',
);
