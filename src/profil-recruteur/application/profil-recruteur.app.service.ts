import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { FilesService } from '../../files/files.service';
import { UpdateProfilRecruteurDto } from '../dto/update-profil-recruteur.dto';
import { ProfilRecruteurDomainService } from '../domain/profil-recruteur.domain.service';
import {
  PROFIL_RECRUTEUR_REPOSITORY,
} from '../domain/profil-recruteur.repository';
import type { ProfilRecruteurRepository } from '../domain/profil-recruteur.repository';
import { Inject } from '@nestjs/common';

type AccessUser = { sub: string; role: Role };

@Injectable()
export class ProfilRecruteurAppService {
  constructor(
    @Inject(PROFIL_RECRUTEUR_REPOSITORY)
    private readonly repo: ProfilRecruteurRepository,
    private readonly domain: ProfilRecruteurDomainService,
    private readonly files: FilesService,
  ) {}

  getInfo(user: AccessUser) {
    const userId = this.ensureRecruteur(user);
    return this.repo.findByUserId(userId);
  }

  async updateProfile(user: AccessUser, input: UpdateProfilRecruteurDto) {
    const userId = this.ensureRecruteur(user);
    const existing = await this.repo.findByUserId(userId);
    if (!existing) {
      throw new NotFoundException('Personnel introuvable');
    }

    const { telephones, ...profileInput } = input;
    const merged = { ...existing, ...profileInput };
    const verifie = this.domain.isProfileCompleted(merged);

    if (telephones !== undefined) {
      const principalCount = this.domain.countPrimaryPhones(telephones);
      if (principalCount > 1) {
        throw new BadRequestException(
          'Un seul téléphone principal est autorisé',
        );
      }
    }

    const updated = await this.repo.updateByUserId(userId, {
      ...profileInput,
      verifie,
    });

    if (telephones !== undefined) {
      await this.repo.replaceTelephones(userId, telephones);
    }

    return updated;
  }

  async updatePhoto(user: AccessUser, file: Express.Multer.File) {
    const userId = this.ensureRecruteur(user);
    const existing = await this.repo.findByUserId(userId);
    if (!existing) {
      throw new NotFoundException('Personnel introuvable');
    }

    const previousPhoto = existing.photo;
    const displayName = `${existing.nom}-${existing.prenom}`;
    const photo = await this.files.moveToEntityFolder(
      file,
      'recruteur',
      'photo',
      displayName,
    );
    const merged = { ...existing, photo: photo.path };
    const verifie = this.domain.isProfileCompleted(merged);

    const updated = await this.repo.updateByUserId(userId, {
      photo: photo.path,
      verifie,
    });
    await this.files.removeFile(previousPhoto);
    return updated;
  }

  private ensureRecruteur(user: AccessUser) {
    if (!user || user.role !== Role.RECRUTEUR) {
      throw new UnauthorizedException('Accès réservé aux recruteurs');
    }
    return user.sub;
  }
}
