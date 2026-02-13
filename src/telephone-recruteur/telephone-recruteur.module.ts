import { Module } from '@nestjs/common';
import { TelephoneRecruteurController } from './telephone-recruteur.controller';
import { TelephoneRecruteurAppService } from './application/telephone-recruteur.app.service';
import { TelephoneRecruteurDomainService } from './domain/telephone-recruteur.domain.service';
import { TELEPHONE_RECRUTEUR_REPOSITORY } from './domain/telephone-recruteur.repository';
import { TelephoneRecruteurPrismaRepository } from './infrastructure/telephone-recruteur.prisma.repository';

@Module({
  controllers: [TelephoneRecruteurController],
  providers: [
    TelephoneRecruteurAppService,
    TelephoneRecruteurDomainService,
    {
      provide: TELEPHONE_RECRUTEUR_REPOSITORY,
      useClass: TelephoneRecruteurPrismaRepository,
    },
  ],
})
export class TelephoneRecruteurModule {}
