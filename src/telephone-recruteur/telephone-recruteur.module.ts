import { Module } from '@nestjs/common';
import { TelephoneRecruteurController } from './telephone-recruteur.controller';
import { TelephoneRecruteurService } from './telephone-recruteur.service';

@Module({
  controllers: [TelephoneRecruteurController],
  providers: [TelephoneRecruteurService],
})
export class TelephoneRecruteurModule {}
