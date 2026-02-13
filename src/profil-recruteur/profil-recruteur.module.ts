import { Module } from '@nestjs/common';
import { FilesModule } from '../files/files.module';
import { ProfilRecruteurService } from './profil-recruteur.service';
import { ProfilRecruteurController } from './profil-recruteur.controller';

@Module({
  imports: [FilesModule],
  controllers: [ProfilRecruteurController],
  providers: [ProfilRecruteurService],
})
export class ProfilRecruteurModule {}
