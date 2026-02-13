import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateTelephoneCandidatDto,
  UpdateTelephoneCandidatDto,
} from './dto/telephone-candidat.dto';

type AccessUser = { sub: string; role: Role };

@Injectable()
export class TelephoneCandidatService {
  constructor(private readonly prisma: PrismaService) {}

  list(user: AccessUser) {
    const userId = this.ensureCandidat(user);
    return this.prisma.telephoneCandidat.findMany({
      where: { candidatId: userId },
      orderBy: [{ isPhonePrincipal: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async create(user: AccessUser, input: CreateTelephoneCandidatDto) {
    const userId = this.ensureCandidat(user);
    const profil = await this.prisma.profilCandidat.findUnique({
      where: { utilisateurId: userId },
      select: { utilisateurId: true },
    });
    if (!profil) {
      throw new NotFoundException('Candidat introuvable');
    }

    if (input.isPhonePrincipal) {
      return this.prisma.$transaction(async (tx) => {
        await tx.telephoneCandidat.updateMany({
          where: { candidatId: userId, isPhonePrincipal: true },
          data: { isPhonePrincipal: false },
        });

        return tx.telephoneCandidat.create({
          data: {
            candidatId: userId,
            telephone: input.telephone,
            isPhonePrincipal: true,
          },
        });
      });
    }

    return this.prisma.telephoneCandidat.create({
      data: {
        candidatId: userId,
        telephone: input.telephone,
        isPhonePrincipal: input.isPhonePrincipal ?? false,
      },
    });
  }

  async update(
    user: AccessUser,
    id: string,
    input: UpdateTelephoneCandidatDto,
  ) {
    const userId = this.ensureCandidat(user);
    const existing = await this.prisma.telephoneCandidat.findUnique({
      where: { id },
    });

    if (!existing || existing.candidatId !== userId) {
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

    return this.prisma.telephoneCandidat.update({
      where: { id },
      data,
    });
  }

  async remove(user: AccessUser, id: string) {
    const userId = this.ensureCandidat(user);
    const existing = await this.prisma.telephoneCandidat.findUnique({
      where: { id },
    });

    if (!existing || existing.candidatId !== userId) {
      throw new NotFoundException('Telephone introuvable');
    }

    return this.prisma.telephoneCandidat.delete({ where: { id } });
  }

  private ensureCandidat(user: AccessUser) {
    if (!user || user.role !== Role.CANDIDAT) {
      throw new ForbiddenException('Acces reserve aux candidats');
    }
    return user.sub;
  }
}
