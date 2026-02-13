import { Module } from '@nestjs/common';
import { EntrepriseController } from './entreprise.controller';
import { FilesModule } from 'src/files/files.module';
import { EntrepriseAppService } from './application/entreprise.app.service';
import { EntrepriseDomainService } from './domain/entreprise.domain.service';
import { ENTREPRISE_REPOSITORY } from './domain/entreprise.repository';
import { EntreprisePrismaRepository } from './infrastructure/entreprise.prisma.repository';
import { RolesGuard } from '../auth/roles.guard';

@Module({
  imports: [FilesModule],
  controllers: [EntrepriseController],
  providers: [
    EntrepriseAppService,
    EntrepriseDomainService,
    { provide: ENTREPRISE_REPOSITORY, useClass: EntreprisePrismaRepository },
    RolesGuard,
  ],
})
export class EntrepriseModule {}
