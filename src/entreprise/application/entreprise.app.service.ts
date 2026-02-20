import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { FilesService } from '../../files/files.service';
import { EntrepriseDto } from '../dto/entreprise.dto';
import {
  CreateEntrepriseInput,
  ENTREPRISE_REPOSITORY,
} from '../domain/entreprise.repository';
import type { EntrepriseRepository } from '../domain/entreprise.repository';
import { EntrepriseDomainService } from '../domain/entreprise.domain.service';
import { Role } from '@prisma/client';

type AccessUser = { sub: string; role: Role };

@Injectable()
export class EntrepriseAppService {
  constructor(
    @Inject(ENTREPRISE_REPOSITORY)
    private readonly repo: EntrepriseRepository,
    private readonly domain: EntrepriseDomainService,
    private readonly files: FilesService,
  ) {}

  async createEntreprise(input: Omit<CreateEntrepriseInput, 'verifie'>) {
    const existing = await this.repo.findByName(input.nom);
    if (existing) {
      throw new NotFoundException('Cette entreprise existe déjà');
    }

    const verifie = this.domain.isVerified({
      nom: input.nom,
      ville: input.ville,
      paysId: input.paysId,
      siegeSocial: input.siegeSocial,
      logo: input.logo,
    });

    return this.repo.create({ ...input, verifie });
  }

  async updateEntreprise(user: AccessUser, id: string, input: EntrepriseDto) {
    await this.ensureRecruteurEntreprise(user, id);
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new NotFoundException('Entreprise introuvable');
    }

    const verifie = this.domain.isVerified({
      nom: input.nom,
      ville: input.ville ?? existing.ville,
      paysId: input.paysId,
      siegeSocial: input.siegeSocial,
      logo: existing.logo,
    });

    return this.repo.update(id, { ...input, verifie });
  }

  async updateLogo(user: AccessUser, id: string, file: Express.Multer.File) {
    await this.ensureRecruteurEntreprise(user, id);
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new NotFoundException('Entreprise introuvable');
    }

    const logo = await this.files.moveToEntityFolder(
      file,
      'entreprise',
      'logo',
      existing.nom,
    );
    const verifie = this.domain.isVerified({
      nom: existing.nom,
      ville: existing.ville,
      paysId: existing.paysId,
      siegeSocial: existing.siegeSocial,
      logo: logo.path,
    });

    const updated = await this.repo.update(id, {
      logo: logo.path,
      verifie,
    });
    await this.files.removeFile(existing.logo);
    return updated;
  }

  findAll() {
    return this.repo.findAll();
  }

  async findById(id: string) {
    const entreprise = await this.repo.findById(id);
    if (!entreprise) {
      throw new NotFoundException('Entreprise introuvable');
    }
    return entreprise;
  }

  private async ensureRecruteurEntreprise(
    user: AccessUser,
    entrepriseId: string,
  ) {
    if (!user || user.role !== Role.RECRUTEUR) {
      throw new UnauthorizedException(
        "Seul un membre du personnel de l'entreprise peut modifier le logo",
      );
    }

    const linkedEntrepriseId = await this.repo.findEntrepriseIdForRecruteur(
      user.sub,
    );

    if (!linkedEntrepriseId || linkedEntrepriseId !== entrepriseId) {
      throw new UnauthorizedException(
        "Vous ne pouvez modifier que l'entreprise à laquelle vous êtes rattaché",
      );
    }
  }
}
