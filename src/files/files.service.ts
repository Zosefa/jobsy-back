import { BadRequestException, Injectable } from '@nestjs/common';
import { diskStorage, type Options as MulterOptions } from 'multer';
import { mkdir } from 'node:fs';
import { copyFile, rename, unlink } from 'node:fs/promises';
import { extname, join, normalize, sep } from 'node:path';
import { randomUUID } from 'node:crypto';

type ProfileKind = 'candidat' | 'recruteur' | 'admin' | 'entreprise';
type UploadKind = 'photo' | 'cv' | 'logo';

const UPLOAD_BASE = join(process.cwd(), 'uploads');

const DESTINATIONS: Record<ProfileKind, Partial<Record<UploadKind, string>>> = {
  candidat: {
    photo: 'candidat/photo',
    cv: 'candidat/cv',
  },
  recruteur: {
    photo: 'recruteur/photo',
  },
  admin: {
    photo: 'admin/photo',
  },
  entreprise: {
    logo: 'entreprise/logo',
  },
};

@Injectable()
export class FilesService {
  private static sanitizeSegment(value: string): string {
    const cleaned = value
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase();
    return cleaned || 'unknown';
  }

  private static buildEntityDir(
    profile: ProfileKind,
    kind: UploadKind,
    name: string,
  ) {
    const safeName = FilesService.sanitizeSegment(name);
    return normalize(join(UPLOAD_BASE, profile, safeName, kind));
  }

  static multerOptions(profile: ProfileKind, kind: UploadKind): MulterOptions {
    const destination = FilesService.resolveDestination(profile, kind);
    const maxSize =
      kind === 'photo' || kind === 'logo' ? 2 * 1024 * 1024 : 5 * 1024 * 1024; // 2MB / 5MB

    return {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          mkdir(destination, { recursive: true }, (err) =>
            cb(err, destination),
          );
        },
        filename: (_req, file, cb) => {
          const ext =
            kind === 'cv' ? '.pdf' : extname(file.originalname).toLowerCase();
          cb(null, `${randomUUID()}${ext}`);
        },
      }),
      limits: { fileSize: maxSize },
      fileFilter: (_req, file, cb) => {
        if (kind === 'photo' && !file.mimetype.startsWith('image/')) {
          return cb(new BadRequestException('Fichier non image'));
        }
        if (kind === 'logo' && !file.mimetype.startsWith('image/')) {
          return cb(new BadRequestException('Fichier non image'));
        }
        if (kind === 'cv' && file.mimetype !== 'application/pdf') {
          return cb(new BadRequestException('Seul le PDF est autorisé'));
        }
        return cb(null, true);
      },
    };
  }

  static resolveDestination(profile: ProfileKind, kind: UploadKind): string {
    const subdir = DESTINATIONS[profile]?.[kind];
    if (!subdir) {
      throw new BadRequestException('Type de fichier non supporté');
    }
    return normalize(join(UPLOAD_BASE, subdir));
  }

  buildResponse(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Aucun fichier reçu');
    }
    const relative = file.path.replace(process.cwd(), '').replace(/\\/g, '/');
    return {
      filename: file.filename,
      path: relative,
      mimetype: file.mimetype,
      size: file.size,
    };
  }

  async moveToEntityFolder(
    file: Express.Multer.File,
    profile: ProfileKind,
    kind: UploadKind,
    name: string,
  ) {
    if (!file) {
      throw new BadRequestException('Aucun fichier reçu');
    }

    const destination = FilesService.buildEntityDir(profile, kind, name);
    await new Promise<void>((resolve, reject) => {
      mkdir(destination, { recursive: true }, (err) =>
        err ? reject(err) : resolve(),
      );
    });

    const target = normalize(join(destination, file.filename));
    try {
      await rename(file.path, target);
    } catch {
      await copyFile(file.path, target);
      await unlink(file.path).catch(() => undefined);
    }

    const relative = target.replace(process.cwd(), '').replace(/\\/g, '/');
    return {
      filename: file.filename,
      path: relative,
      mimetype: file.mimetype,
      size: file.size,
    };
  }

  async removeFile(relativePath?: string | null) {
    if (!relativePath) return;

    const cleaned = relativePath.replace(/\\/g, '/').replace(/^\/+/, '');
    const absolutePath = normalize(join(process.cwd(), cleaned));
    const basePath = normalize(`${UPLOAD_BASE}${sep}`);

    if (
      !absolutePath.startsWith(basePath) &&
      absolutePath !== normalize(UPLOAD_BASE)
    ) {
      return;
    }

    try {
      await unlink(absolutePath);
    } catch {
      return;
    }
  }
}
