import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { Inject } from '@nestjs/common';
import {
  CreateTelephoneRecruteurDto,
  UpdateTelephoneRecruteurDto,
} from '../dto/telephone-recruteur.dto';
import { TelephoneRecruteurDomainService } from '../domain/telephone-recruteur.domain.service';
import {
  TELEPHONE_RECRUTEUR_REPOSITORY,
} from '../domain/telephone-recruteur.repository';
import type { TelephoneRecruteurRepository } from '../domain/telephone-recruteur.repository';

type AccessUser = { sub: string; role: Role };

@Injectable()
export class TelephoneRecruteurAppService {
  constructor(
    @Inject(TELEPHONE_RECRUTEUR_REPOSITORY)
    private readonly repo: TelephoneRecruteurRepository,
    private readonly domain: TelephoneRecruteurDomainService,
  ) {}

  list(user: AccessUser) {
    const userId = this.ensureRecruteur(user);
    return this.repo.listByUser(userId);
  }

  async create(user: AccessUser, input: CreateTelephoneRecruteurDto) {
    const userId = this.ensureRecruteur(user);
    const hasProfile = await this.repo.hasProfile(userId);
    if (!hasProfile) {
      throw new NotFoundException('Recruteur introuvable');
    }

    if (input.isPhonePrincipal) {
      return this.repo.createWithPrimary(userId, input.telephone);
    }

    return this.repo.create({
      recruteurId: userId,
      telephone: input.telephone,
      isPhonePrincipal: input.isPhonePrincipal ?? false,
    });
  }

  async update(
    user: AccessUser,
    id: string,
    input: UpdateTelephoneRecruteurDto,
  ) {
    const userId = this.ensureRecruteur(user);
    const existing = await this.repo.findById(id);

    if (!existing || existing.recruteurId !== userId) {
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
    const userId = this.ensureRecruteur(user);
    const existing = await this.repo.findById(id);

    if (!existing || existing.recruteurId !== userId) {
      throw new NotFoundException('Telephone introuvable');
    }

    return this.repo.remove(id);
  }

  private ensureRecruteur(user: AccessUser) {
    if (!user || user.role !== Role.RECRUTEUR) {
      throw new ForbiddenException('Acces reserve aux recruteurs');
    }
    return user.sub;
  }
}
