import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePaysInput, PaysRepository } from '../domain/pays.repository';

@Injectable()
export class PaysPrismaRepository implements PaysRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(order: 'asc' | 'desc') {
    return this.prisma.pays.findMany({ orderBy: { nom: order } });
  }

  findById(id: string) {
    return this.prisma.pays.findUnique({ where: { id } });
  }

  findByNom(nom: string) {
    return this.prisma.pays.findFirst({ where: { nom } });
  }

  create(data: CreatePaysInput) {
    return this.prisma.pays.create({ data });
  }
}
