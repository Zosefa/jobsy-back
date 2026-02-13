import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { FilesService } from '../files/files.service';
import { UpdateProfilRecruteurDto } from './dto/update-profil-recruteur.dto';

type AccessUser = { sub: string; role: Role };

@Injectable()
export class ProfilRecruteurService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly files: FilesService,
  ) {}

  getInfo(user: AccessUser) {
    const userId = this.ensureRecruteur(user);
    return this.prisma.profilRecruteur.findUnique({
      where: { utilisateurId: userId },
    });
  }

  async updateProfile(user: AccessUser, input: UpdateProfilRecruteurDto) {
    const userId = this.ensureRecruteur(user);
    const existing = await this.prisma.profilRecruteur.findUnique({
      where: { utilisateurId: userId },
    });
    if (!existing) {
      throw new NotFoundException('Personnel introuvable');
    }

    const merged = { ...existing, ...input };
    const profilCompleted = this.isProfileCompleted(merged);

    return this.prisma.profilRecruteur.update({
      where: { utilisateurId: userId },
      data: { ...input, verifie: profilCompleted },
    });
  }

  async updatePhoto(user: AccessUser, file: Express.Multer.File) {
    const userId = this.ensureRecruteur(user);
    const existing = await this.prisma.profilRecruteur.findUnique({
      where: { utilisateurId: userId },
    });
    if (!existing) {
      throw new NotFoundException('Personnel introuvable');
    }

    const photoPath = this.files.buildResponse(file).path;
    const merged = { ...existing, photo: photoPath };
    const profilCompleted = this.isProfileCompleted(merged);

    return this.prisma.profilRecruteur.update({
      where: { utilisateurId: userId },
      data: { photo: photoPath, verifie: profilCompleted },
    });
  }

  private ensureRecruteur(user: AccessUser) {
    if (!user || user.role !== Role.RECRUTEUR) {
      throw new ForbiddenException('Accès réservé aux recruteurs');
    }
    return user.sub;
  }

  private isProfileCompleted(input: {
    nom?: string | null;
    prenom?: string | null;
    photo?: string | null;
    fonction?: string | null;
  }) {
    return (
      !!input.nom?.trim() &&
      !!input.prenom?.trim() &&
      !!input.photo?.trim() &&
      !!input.fonction?.trim()
    );
  }
}
