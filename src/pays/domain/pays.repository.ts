import type { Pays } from '@prisma/client';

export type CreatePaysInput = {
  nom: string;
  codeIso2: string;
  codeIso3?: string;
};

export interface PaysRepository {
  findAll(order: 'asc' | 'desc'): Promise<Pays[]>;
  findById(id: string): Promise<Pays | null>;
  findByNom(nom: string): Promise<Pays | null>;
  create(data: CreatePaysInput): Promise<Pays>;
}

export const PAYS_REPOSITORY = Symbol('PAYS_REPOSITORY');
