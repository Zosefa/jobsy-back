import { EntrepriseDto } from './dto/entreprise.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { FilesService } from 'src/files/files.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class EntrepriseService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly files: FilesService,
  ) {}

  async createEntreprise(input: {
    nom: string;
    ville?: string;
    paysId: string;
    siegeSocial?: string;
    logo?: string;
  }) {
    const existing = await this.prisma.entreprise.findFirst({
      where: { nom: input.nom },
    });

    if (existing) {
      throw new NotFoundException('Cette entreprise existe déjà');
    }
    const merged = { ...input };
    const entrepriseVerified = this.isEntrepriseVerifed(merged);
    return this.prisma.entreprise.create({
      data: { ...input, verifie: entrepriseVerified },
    });
  }

  async updateEntreprise(id: string, input: EntrepriseDto) {
    const existing = await this.prisma.entreprise.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Entreprise introuvable');
    }

    const entrepriseVerified = this.isEntrepriseVerifed({
      nom: input.nom,
      ville: input.ville ?? existing.ville,
      paysId: input.paysId,
      siegeSocial: input.siegeSocial,
      logo: existing.logo,
    });
    return this.prisma.entreprise.update({
      where: { id },
      data: { ...input, verifie: entrepriseVerified },
    });
  }

  async updateLogo(id: string, file: Express.Multer.File) {
    const existing = await this.prisma.entreprise.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Entreprise introuvable');
    }
    const logoPath = this.files.buildResponse(file).path;

    const entrepriseVerified = this.isEntrepriseVerifed({
      nom: existing.nom,
      ville: existing.ville,
      paysId: existing.paysId,
      siegeSocial: existing.siegeSocial,
      logo: logoPath,
    });
    return this.prisma.entreprise.update({
      where: { id: id },
      data: { logo: logoPath, verifie: entrepriseVerified },
    });
  }

  async findAll() {
    return this.prisma.entreprise.findMany();
  }

  async findById(id: string) {
    const entreprise = await this.prisma.entreprise.findUnique({
      where: { id },
    });
    if (!entreprise) {
      throw new NotFoundException('Entreprise introuvable');
    }
    return entreprise;
  }

  private isEntrepriseVerifed(input: {
    nom: string;
    ville?: string | null;
    paysId: string;
    siegeSocial?: string | null;
    logo?: string | null;
  }) {
    return (
      !!input.nom.trim() &&
      !!input.paysId.trim() &&
      !!input.ville?.trim() &&
      !!input.siegeSocial?.trim() &&
      !!input.logo?.trim()
    );
  }
}
