import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaysService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.pays.findMany({ orderBy: { nom: 'asc' } });
  }

  findById(id: string) {
    return this.prisma.pays.findUnique({ where: { id } });
  }
}
