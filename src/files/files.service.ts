import { BadRequestException, Injectable } from '@nestjs/common';
import { diskStorage, type Options as MulterOptions } from 'multer';
import { mkdir } from 'node:fs';
import { extname, join, normalize } from 'node:path';
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
}
