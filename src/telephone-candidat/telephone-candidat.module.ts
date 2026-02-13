import { Module } from '@nestjs/common';
import { TelephoneCandidatController } from './telephone-candidat.controller';
import { TelephoneCandidatService } from './telephone-candidat.service';

@Module({
  controllers: [TelephoneCandidatController],
  providers: [TelephoneCandidatService],
})
export class TelephoneCandidatModule {}
