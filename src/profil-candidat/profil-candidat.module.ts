import { Module } from '@nestjs/common';
import { ProfilCandidatController } from './profil-candidat.controller';
import { ProfilCandidatService } from './profil-candidat.service';
import { FilesModule } from '../files/files.module';

@Module({
  imports: [FilesModule],
  controllers: [ProfilCandidatController],
  providers: [ProfilCandidatService],
})
export class ProfilCandidatModule {}
