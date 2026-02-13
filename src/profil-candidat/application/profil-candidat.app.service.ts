import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { FilesService } from '../../files/files.service';
import { UpdateProfilCandidatDto } from '../dto/update-profil-candidat.dto';
import { ProfilCandidatDomainService } from '../domain/profil-candidat.domain.service';
import {
  PROFIL_CANDIDAT_REPOSITORY,
} from '../domain/profil-candidat.repository';
import type { ProfilCandidatRepository } from '../domain/profil-candidat.repository';
import { Inject } from '@nestjs/common';

type AccessUser = { sub: string; role: Role };

@Injectable()
export class ProfilCandidatAppService {
  constructor(
    @Inject(PROFIL_CANDIDAT_REPOSITORY)
    private readonly repo: ProfilCandidatRepository,
    private readonly domain: ProfilCandidatDomainService,
    private readonly files: FilesService,
  ) {}

  getInfo(user: AccessUser) {
    const userId = this.ensureCandidat(user);
    return this.repo.findByUserId(userId);
  }

  async updateProfile(user: AccessUser, input: UpdateProfilCandidatDto) {
    const userId = this.ensureCandidat(user);
    const existing = await this.repo.findByUserId(userId);
    if (!existing) {
      throw new NotFoundException('Candidat introuvable');
    }

    const { telephones, ...profileInput } = input;
    const merged = { ...existing, ...profileInput };
    const profilCompleted = this.domain.isProfileCompleted(merged);

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
      profilCompleted,
    });

    if (telephones !== undefined) {
      await this.repo.replaceTelephones(userId, telephones);
    }

    return updated;
  }

  async updatePhoto(user: AccessUser, file: Express.Multer.File) {
    const userId = this.ensureCandidat(user);
    const existing = await this.repo.findByUserId(userId);
    if (!existing) {
      throw new NotFoundException('Profil candidat introuvable');
    }

    const previousPhoto = existing.photo;
    const displayName = `${existing.nom}-${existing.prenom}`;
    const photo = await this.files.moveToEntityFolder(
      file,
      'candidat',
      'photo',
      displayName,
    );
    const merged = { ...existing, photo: photo.path };
    const profilCompleted = this.domain.isProfileCompleted(merged);

    const updated = await this.repo.updateByUserId(userId, {
      photo: photo.path,
      profilCompleted,
    });
    await this.files.removeFile(previousPhoto);
    return updated;
  }

  async updateCv(user: AccessUser, file: Express.Multer.File) {
    const userId = this.ensureCandidat(user);
    const existing = await this.repo.findByUserId(userId);
    if (!existing) {
      throw new NotFoundException('Candidat introuvable');
    }

    const previousResume = existing.resume;
    const displayName = `${existing.nom}-${existing.prenom}`;
    const cv = await this.files.moveToEntityFolder(
      file,
      'candidat',
      'cv',
      displayName,
    );
    const merged = { ...existing, resume: cv.path };
    const profilCompleted = this.domain.isProfileCompleted(merged);

    const updated = await this.repo.updateByUserId(userId, {
      resume: cv.path,
      profilCompleted,
    });
    await this.files.removeFile(previousResume);
    return updated;
  }

  private ensureCandidat(user: AccessUser) {
    if (!user || user.role !== Role.CANDIDAT) {
      throw new UnauthorizedException('Accès réservé aux candidats');
    }
    return user.sub;
  }
}
