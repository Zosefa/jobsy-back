import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  ProfilRecruteurRepository,
  ProfilRecruteurTelephoneInput,
  UpdateProfilRecruteurInput,
} from '../domain/profil-recruteur.repository';

@Injectable()
export class ProfilRecruteurPrismaRepository implements ProfilRecruteurRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByUserId(userId: string) {
    return this.prisma.profilRecruteur.findUnique({
      where: { utilisateurId: userId },
    });
  }

  updateByUserId(userId: string, data: UpdateProfilRecruteurInput) {
    return this.prisma.profilRecruteur.update({
      where: { utilisateurId: userId },
      data,
    });
  }

  async replaceTelephones(
    userId: string,
    telephones: ProfilRecruteurTelephoneInput[],
  ) {
    await this.prisma.$transaction(async (tx) => {
      await tx.telephoneRecruteur.deleteMany({
        where: { recruteurId: userId },
      });

      if (telephones.length === 0) return;

      await tx.telephoneRecruteur.createMany({
        data: telephones.map((tel) => ({
          recruteurId: userId,
          telephone: tel.telephone,
          isPhonePrincipal: tel.isPhonePrincipal ?? false,
        })),
      });
    });
  }
}
