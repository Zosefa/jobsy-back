import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  ProfilCandidatRepository,
  ProfilCandidatTelephoneInput,
  UpdateProfilCandidatInput,
} from '../domain/profil-candidat.repository';

@Injectable()
export class ProfilCandidatPrismaRepository implements ProfilCandidatRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByUserId(userId: string) {
    return this.prisma.profilCandidat.findUnique({
      where: { utilisateurId: userId },
    });
  }

  updateByUserId(userId: string, data: UpdateProfilCandidatInput) {
    return this.prisma.profilCandidat.update({
      where: { utilisateurId: userId },
      data,
    });
  }

  async replaceTelephones(
    userId: string,
    telephones: ProfilCandidatTelephoneInput[],
  ) {
    await this.prisma.$transaction(async (tx) => {
      await tx.telephoneCandidat.deleteMany({ where: { candidatId: userId } });

      if (telephones.length === 0) return;

      await tx.telephoneCandidat.createMany({
        data: telephones.map((tel) => ({
          candidatId: userId,
          telephone: tel.telephone,
          isPhonePrincipal: tel.isPhonePrincipal ?? false,
        })),
      });
    });
  }
}
