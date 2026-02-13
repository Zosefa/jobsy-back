import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { FilesModule } from './files/files.module';
import { ProfilCandidatModule } from './profil-candidat/profil-candidat.module';
import { EntrepriseModule } from './entreprise/entreprise.module';
import { ProfilRecruteurModule } from './profil-recruteur/profil-recruteur.module';
import { TelephoneRecruteurModule } from './telephone-recruteur/telephone-recruteur.module';
import { TelephoneCandidatModule } from './telephone-candidat/telephone-candidat.module';
import { PaysModule } from './pays/pays.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    FilesModule,
    ProfilCandidatModule,
    EntrepriseModule,
    ProfilRecruteurModule,
    TelephoneRecruteurModule,
    TelephoneCandidatModule,
    PaysModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
