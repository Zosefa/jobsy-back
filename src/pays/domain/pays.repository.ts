import type { Pays } from '@prisma/client';

export interface PaysRepository {
  findAll(order: 'asc' | 'desc'): Promise<Pays[]>;
  findById(id: string): Promise<Pays | null>;
}

export const PAYS_REPOSITORY = Symbol('PAYS_REPOSITORY');
