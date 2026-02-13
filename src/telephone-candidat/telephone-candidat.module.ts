import { Module } from '@nestjs/common';
import { TelephoneCandidatController } from './telephone-candidat.controller';
import { TelephoneCandidatAppService } from './application/telephone-candidat.app.service';
import { TelephoneCandidatDomainService } from './domain/telephone-candidat.domain.service';
import { TELEPHONE_CANDIDAT_REPOSITORY } from './domain/telephone-candidat.repository';
import { TelephoneCandidatPrismaRepository } from './infrastructure/telephone-candidat.prisma.repository';

@Module({
  controllers: [TelephoneCandidatController],
  providers: [
    TelephoneCandidatAppService,
    TelephoneCandidatDomainService,
    {
      provide: TELEPHONE_CANDIDAT_REPOSITORY,
      useClass: TelephoneCandidatPrismaRepository,
    },
  ],
})
export class TelephoneCandidatModule {}
