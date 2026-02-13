import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaysRepository } from '../domain/pays.repository';

@Injectable()
export class PaysPrismaRepository implements PaysRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(order: 'asc' | 'desc') {
    return this.prisma.pays.findMany({ orderBy: { nom: order } });
  }

  findById(id: string) {
    return this.prisma.pays.findUnique({ where: { id } });
  }
}
