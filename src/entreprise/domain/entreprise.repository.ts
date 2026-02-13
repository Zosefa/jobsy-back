import type { Entreprise } from '@prisma/client';

export type CreateEntrepriseInput = {
  nom: string;
  ville?: string;
  paysId: string;
  siegeSocial?: string;
  logo?: string;
  verifie: boolean;
};

export type UpdateEntrepriseInput = {
  nom?: string;
  ville?: string | null;
  paysId?: string;
  siegeSocial?: string | null;
  logo?: string | null;
  verifie?: boolean;
};

export interface EntrepriseRepository {
  findByName(nom: string): Promise<Entreprise | null>;
  findById(id: string): Promise<Entreprise | null>;
  findAll(): Promise<Entreprise[]>;
  findEntrepriseIdForRecruteur(userId: string): Promise<string | null>;
  create(data: CreateEntrepriseInput): Promise<Entreprise>;
  update(id: string, data: UpdateEntrepriseInput): Promise<Entreprise>;
}

export const ENTREPRISE_REPOSITORY = Symbol('ENTREPRISE_REPOSITORY');
