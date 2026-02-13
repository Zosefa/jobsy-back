import { Inject, Injectable } from '@nestjs/common';
import { PaysDomainService } from '../domain/pays.domain.service';
import { PAYS_REPOSITORY } from '../domain/pays.repository';
import type { PaysRepository } from '../domain/pays.repository';

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
}
