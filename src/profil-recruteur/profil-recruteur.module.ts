import { Module } from '@nestjs/common';
import { FilesModule } from '../files/files.module';
import { ProfilRecruteurController } from './profil-recruteur.controller';
import { ProfilRecruteurAppService } from './application/profil-recruteur.app.service';
import { ProfilRecruteurDomainService } from './domain/profil-recruteur.domain.service';
import { PROFIL_RECRUTEUR_REPOSITORY } from './domain/profil-recruteur.repository';
import { ProfilRecruteurPrismaRepository } from './infrastructure/profil-recruteur.prisma.repository';

@Module({
  imports: [FilesModule],
  controllers: [ProfilRecruteurController],
  providers: [
    ProfilRecruteurAppService,
    ProfilRecruteurDomainService,
    {
      provide: PROFIL_RECRUTEUR_REPOSITORY,
      useClass: ProfilRecruteurPrismaRepository,
    },
  ],
})
export class ProfilRecruteurModule {}
