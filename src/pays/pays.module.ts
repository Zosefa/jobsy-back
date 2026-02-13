import { Module } from '@nestjs/common';
import { PaysController } from './pays.controller';
import { PaysAppService } from './application/pays.app.service';
import { PaysDomainService } from './domain/pays.domain.service';
import { PAYS_REPOSITORY } from './domain/pays.repository';
import { PaysPrismaRepository } from './infrastructure/pays.prisma.repository';

@Module({
  controllers: [PaysController],
  providers: [
    PaysAppService,
    PaysDomainService,
    { provide: PAYS_REPOSITORY, useClass: PaysPrismaRepository },
  ],
})
export class PaysModule {}
