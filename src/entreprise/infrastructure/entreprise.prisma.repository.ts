import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateEntrepriseInput,
  EntrepriseRepository,
  UpdateEntrepriseInput,
} from '../domain/entreprise.repository';

@Injectable()
export class EntreprisePrismaRepository implements EntrepriseRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByName(nom: string) {
    return this.prisma.entreprise.findFirst({ where: { nom } });
  }

  findById(id: string) {
    return this.prisma.entreprise.findUnique({ where: { id } });
  }

  findAll() {
    return this.prisma.entreprise.findMany();
  }

  async findEntrepriseIdForRecruteur(userId: string) {
    const profil = await this.prisma.profilRecruteur.findUnique({
      where: { utilisateurId: userId },
      select: { entrepriseId: true },
    });
    return profil?.entrepriseId ?? null;
  }

  create(data: CreateEntrepriseInput) {
    return this.prisma.entreprise.create({ data });
  }

  update(id: string, data: UpdateEntrepriseInput) {
    return this.prisma.entreprise.update({ where: { id }, data });
  }
}
