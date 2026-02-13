import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateTelephoneCandidatInput,
  TelephoneCandidatRepository,
  UpdateTelephoneCandidatInput,
} from '../domain/telephone-candidat.repository';

@Injectable()
export class TelephoneCandidatPrismaRepository
  implements TelephoneCandidatRepository
{
  constructor(private readonly prisma: PrismaService) {}

  listByUser(userId: string) {
    return this.prisma.telephoneCandidat.findMany({
      where: { candidatId: userId },
      orderBy: [{ isPhonePrincipal: 'desc' }, { createdAt: 'desc' }],
    });
  }

  findById(id: string) {
    return this.prisma.telephoneCandidat.findUnique({ where: { id } });
  }

  create(data: CreateTelephoneCandidatInput) {
    return this.prisma.telephoneCandidat.create({ data });
  }

  update(id: string, data: UpdateTelephoneCandidatInput) {
    return this.prisma.telephoneCandidat.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.telephoneCandidat.delete({ where: { id } });
  }

  async clearPrimary(userId: string) {
    await this.prisma.telephoneCandidat.updateMany({
      where: { candidatId: userId, isPhonePrincipal: true },
      data: { isPhonePrincipal: false },
    });
  }

  async createWithPrimary(userId: string, telephone: string) {
    return this.prisma.$transaction(async (tx) => {
      await tx.telephoneCandidat.updateMany({
        where: { candidatId: userId, isPhonePrincipal: true },
        data: { isPhonePrincipal: false },
      });

      return tx.telephoneCandidat.create({
        data: {
          candidatId: userId,
          telephone,
          isPhonePrincipal: true,
        },
      });
    });
  }

  async updateWithPrimary(
    userId: string,
    id: string,
    data: UpdateTelephoneCandidatInput,
  ) {
    return this.prisma.$transaction(async (tx) => {
      await tx.telephoneCandidat.updateMany({
        where: { candidatId: userId, isPhonePrincipal: true },
        data: { isPhonePrincipal: false },
      });

      return tx.telephoneCandidat.update({
        where: { id },
        data: { ...data, isPhonePrincipal: true },
      });
    });
  }

  async hasProfile(userId: string) {
    const profil = await this.prisma.profilCandidat.findUnique({
      where: { utilisateurId: userId },
      select: { utilisateurId: true },
    });
    return !!profil;
  }
}
