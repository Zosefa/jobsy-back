import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfilCandidatDto } from './dto/update-profil-candidat.dto';
import { FilesService } from '../files/files.service';

type AccessUser = { sub: string; role: Role };

@Injectable()
export class ProfilCandidatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly files: FilesService,
  ) {}

  getInfo(user: AccessUser) {
    const userId = this.ensureCandidat(user);
    return this.prisma.profilCandidat.findUnique({
      where: { utilisateurId: userId },
    });
  }

  async updateProfile(user: AccessUser, input: UpdateProfilCandidatDto) {
    const userId = this.ensureCandidat(user);
    const existing = await this.prisma.profilCandidat.findUnique({
      where: { utilisateurId: userId },
    });
    if (!existing) {
      throw new NotFoundException('Candidat introuvable');
    }

    const merged = { ...existing, ...input };
    const profilCompleted = this.isProfileCompleted(merged);

    return this.prisma.profilCandidat.update({
      where: { utilisateurId: userId },
      data: { ...input, profilCompleted },
    });
  }

  async updatePhoto(user: AccessUser, file: Express.Multer.File) {
    const userId = this.ensureCandidat(user);
    const existing = await this.prisma.profilCandidat.findUnique({
      where: { utilisateurId: userId },
    });
    if (!existing) {
      throw new NotFoundException('Profil candidat introuvable');
    }

    const photoPath = this.files.buildResponse(file).path;
    const merged = { ...existing, photo: photoPath };
    const profilCompleted = this.isProfileCompleted(merged);

    return this.prisma.profilCandidat.update({
      where: { utilisateurId: userId },
      data: { photo: photoPath, profilCompleted },
    });
  }

  async updateCv(user: AccessUser, file: Express.Multer.File) {
    const userId = this.ensureCandidat(user);
    const existing = await this.prisma.profilCandidat.findUnique({
      where: { utilisateurId: userId },
    });
    if (!existing) {
      throw new NotFoundException('Candidat introuvable');
    }

    const cvPath = this.files.buildResponse(file).path;
    const merged = { ...existing, resume: cvPath };
    const profilCompleted = this.isProfileCompleted(merged);

    return this.prisma.profilCandidat.update({
      where: { utilisateurId: userId },
      data: { resume: cvPath, profilCompleted },
    });
  }

  private ensureCandidat(user: AccessUser) {
    if (!user || user.role !== Role.CANDIDAT) {
      throw new ForbiddenException('Accès réservé aux candidats');
    }
    return user.sub;
  }

  private isProfileCompleted(input: {
    nom?: string | null;
    prenom?: string | null;
    photo?: string | null;
    paysId?: string | null;
    ville?: string | null;
    adresse?: string | null;
    resume?: string | null;
    anneesExperience?: number | null;
  }) {
    return (
      !!input.nom?.trim() &&
      !!input.prenom?.trim() &&
      !!input.photo?.trim() &&
      !!input.paysId?.trim() &&
      !!input.ville?.trim() &&
      !!input.adresse?.trim() &&
      !!input.resume?.trim() &&
      input.anneesExperience !== undefined &&
      input.anneesExperience !== null
    );
  }
}
