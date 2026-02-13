import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateTelephoneRecruteurDto,
  UpdateTelephoneRecruteurDto,
} from './dto/telephone-recruteur.dto';

type AccessUser = { sub: string; role: Role };

@Injectable()
export class TelephoneRecruteurService {
  constructor(private readonly prisma: PrismaService) {}

  list(user: AccessUser) {
    const userId = this.ensureRecruteur(user);
    return this.prisma.telephoneRecruteur.findMany({
      where: { recruteurId: userId },
      orderBy: [{ isPhonePrincipal: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async create(user: AccessUser, input: CreateTelephoneRecruteurDto) {
    const userId = this.ensureRecruteur(user);
    const profil = await this.prisma.profilRecruteur.findUnique({
      where: { utilisateurId: userId },
      select: { utilisateurId: true },
    });
    if (!profil) {
      throw new NotFoundException('Recruteur introuvable');
    }

    if (input.isPhonePrincipal) {
      return this.prisma.$transaction(async (tx) => {
        await tx.telephoneRecruteur.updateMany({
          where: { recruteurId: userId, isPhonePrincipal: true },
          data: { isPhonePrincipal: false },
        });

        return tx.telephoneRecruteur.create({
          data: {
            recruteurId: userId,
            telephone: input.telephone,
            isPhonePrincipal: true,
          },
        });
      });
    }

    return this.prisma.telephoneRecruteur.create({
      data: {
        recruteurId: userId,
        telephone: input.telephone,
        isPhonePrincipal: input.isPhonePrincipal ?? false,
      },
    });
  }

  async update(
    user: AccessUser,
    id: string,
    input: UpdateTelephoneRecruteurDto,
  ) {
    const userId = this.ensureRecruteur(user);
    const existing = await this.prisma.telephoneRecruteur.findUnique({
      where: { id },
    });

    if (!existing || existing.recruteurId !== userId) {
      throw new NotFoundException('Telephone introuvable');
    }

    const data: { telephone?: string; isPhonePrincipal?: boolean } = {};
    if (input.telephone !== undefined) data.telephone = input.telephone;
    if (input.isPhonePrincipal !== undefined)
      data.isPhonePrincipal = input.isPhonePrincipal;

    if (Object.keys(data).length === 0) {
      throw new BadRequestException('Aucune modification fournie');
    }

    if (input.isPhonePrincipal) {
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

    return this.prisma.telephoneRecruteur.update({
      where: { id },
      data,
    });
  }

  async remove(user: AccessUser, id: string) {
    const userId = this.ensureRecruteur(user);
    const existing = await this.prisma.telephoneRecruteur.findUnique({
      where: { id },
    });

    if (!existing || existing.recruteurId !== userId) {
      throw new NotFoundException('Telephone introuvable');
    }

    return this.prisma.telephoneRecruteur.delete({ where: { id } });
  }

  private ensureRecruteur(user: AccessUser) {
    if (!user || user.role !== Role.RECRUTEUR) {
      throw new ForbiddenException('Acces reserve aux recruteurs');
    }
    return user.sub;
  }
}
