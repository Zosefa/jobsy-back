import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { Inject } from '@nestjs/common';
import {
  CreateTelephoneCandidatDto,
  UpdateTelephoneCandidatDto,
} from '../dto/telephone-candidat.dto';
import { TelephoneCandidatDomainService } from '../domain/telephone-candidat.domain.service';
import {
  TELEPHONE_CANDIDAT_REPOSITORY,
} from '../domain/telephone-candidat.repository';
import type { TelephoneCandidatRepository } from '../domain/telephone-candidat.repository';

type AccessUser = { sub: string; role: Role };

@Injectable()
export class TelephoneCandidatAppService {
  constructor(
    @Inject(TELEPHONE_CANDIDAT_REPOSITORY)
    private readonly repo: TelephoneCandidatRepository,
    private readonly domain: TelephoneCandidatDomainService,
  ) {}

  list(user: AccessUser) {
    const userId = this.ensureCandidat(user);
    return this.repo.listByUser(userId);
  }

  async create(user: AccessUser, input: CreateTelephoneCandidatDto) {
    const userId = this.ensureCandidat(user);
    const hasProfile = await this.repo.hasProfile(userId);
    if (!hasProfile) {
      throw new NotFoundException('Candidat introuvable');
    }

    if (input.isPhonePrincipal) {
      return this.repo.createWithPrimary(userId, input.telephone);
    }

    return this.repo.create({
      candidatId: userId,
      telephone: input.telephone,
      isPhonePrincipal: input.isPhonePrincipal ?? false,
    });
  }

  async update(
    user: AccessUser,
    id: string,
    input: UpdateTelephoneCandidatDto,
  ) {
    const userId = this.ensureCandidat(user);
    const existing = await this.repo.findById(id);

    if (!existing || existing.candidatId !== userId) {
      throw new NotFoundException('Telephone introuvable');
    }

    const data = this.domain.buildUpdateData(input);

    if (Object.keys(data).length === 0) {
      throw new BadRequestException('Aucune modification fournie');
    }

    if (input.isPhonePrincipal) {
      return this.repo.updateWithPrimary(userId, id, data);
    }

    return this.repo.update(id, data);
  }

  async remove(user: AccessUser, id: string) {
    const userId = this.ensureCandidat(user);
    const existing = await this.repo.findById(id);

    if (!existing || existing.candidatId !== userId) {
      throw new NotFoundException('Telephone introuvable');
    }

    return this.repo.remove(id);
  }

  private ensureCandidat(user: AccessUser) {
    if (!user || user.role !== Role.CANDIDAT) {
      throw new ForbiddenException('Acces reserve aux candidats');
    }
    return user.sub;
  }
}
