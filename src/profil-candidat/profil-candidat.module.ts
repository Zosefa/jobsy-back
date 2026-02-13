import { Module } from '@nestjs/common';
import { ProfilCandidatController } from './profil-candidat.controller';
import { FilesModule } from '../files/files.module';
import { ProfilCandidatAppService } from './application/profil-candidat.app.service';
import { ProfilCandidatDomainService } from './domain/profil-candidat.domain.service';
import { PROFIL_CANDIDAT_REPOSITORY } from './domain/profil-candidat.repository';
import { ProfilCandidatPrismaRepository } from './infrastructure/profil-candidat.prisma.repository';

@Module({
  imports: [FilesModule],
  controllers: [ProfilCandidatController],
  providers: [
    ProfilCandidatAppService,
    ProfilCandidatDomainService,
    {
      provide: PROFIL_CANDIDAT_REPOSITORY,
      useClass: ProfilCandidatPrismaRepository,
    },
  ],
})
export class ProfilCandidatModule {}
