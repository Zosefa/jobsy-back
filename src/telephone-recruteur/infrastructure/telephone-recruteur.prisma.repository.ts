import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateTelephoneRecruteurInput,
  TelephoneRecruteurRepository,
  UpdateTelephoneRecruteurInput,
} from '../domain/telephone-recruteur.repository';

@Injectable()
export class TelephoneRecruteurPrismaRepository
  implements TelephoneRecruteurRepository
{
  constructor(private readonly prisma: PrismaService) {}

  listByUser(userId: string) {
    return this.prisma.telephoneRecruteur.findMany({
      where: { recruteurId: userId },
      orderBy: [{ isPhonePrincipal: 'desc' }, { createdAt: 'desc' }],
    });
  }

  findById(id: string) {
    return this.prisma.telephoneRecruteur.findUnique({ where: { id } });
  }

  create(data: CreateTelephoneRecruteurInput) {
    return this.prisma.telephoneRecruteur.create({ data });
  }

  update(id: string, data: UpdateTelephoneRecruteurInput) {
    return this.prisma.telephoneRecruteur.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.telephoneRecruteur.delete({ where: { id } });
  }

  async clearPrimary(userId: string) {
    await this.prisma.telephoneRecruteur.updateMany({
      where: { recruteurId: userId, isPhonePrincipal: true },
      data: { isPhonePrincipal: false },
    });
  }

  async createWithPrimary(userId: string, telephone: string) {
    return this.prisma.$transaction(async (tx) => {
      await tx.telephoneRecruteur.updateMany({
        where: { recruteurId: userId, isPhonePrincipal: true },
        data: { isPhonePrincipal: false },
      });

      return tx.telephoneRecruteur.create({
        data: {
          recruteurId: userId,
          telephone,
          isPhonePrincipal: true,
        },
      });
    });
  }

  async updateWithPrimary(
    userId: string,
    id: string,
    data: UpdateTelephoneRecruteurInput,
  ) {
    return this.prisma.$transaction(async (tx) => {
      await tx.telephoneRecruteur.updateMany({
        where: { recruteurId: userId, isPhonePrincipal: true },
        data: { isPhonePrincipal: false },
      });

      return tx.telephoneRecruteur.update({
        where: { id },
        data: { ...data, isPhonePrincipal: true },
      });
    });
  }

  async hasProfile(userId: string) {
    const profil = await this.prisma.profilRecruteur.findUnique({
      where: { utilisateurId: userId },
      select: { utilisateurId: true },
    });
    return !!profil;
  }
}
