import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PaysDomainService } from '../domain/pays.domain.service';
import { PAYS_REPOSITORY } from '../domain/pays.repository';
import type {
  CreatePaysInput,
  PaysRepository,
} from '../domain/pays.repository';

@Injectable()
export class PaysAppService {
  constructor(
    @Inject(PAYS_REPOSITORY) private readonly repo: PaysRepository,
    private readonly domain: PaysDomainService,
  ) {}

  findAll() {
    return this.repo.findAll(this.domain.sortOrder());
  }

  findById(id: string) {
    return this.repo.findById(id);
  }

  async createPays(input: CreatePaysInput) {
    console.log('input', input);
    const existing = await this.repo.findByNom(input.nom);
    console.log('existing', existing);
    if (existing) {
      throw new NotFoundException('Ce Pays existe déjà');
    }

    return this.repo.create(input);
  }
}
