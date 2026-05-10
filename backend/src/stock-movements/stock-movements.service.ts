import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StockMovementsService {
  constructor(private readonly prisma: PrismaService) {}

  findRecent(limit: number) {
    const take = Math.min(Math.max(limit, 1), 200);
    return this.prisma.stockMovement.findMany({
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        product: { select: { name: true } },
        order: { select: { orderNumber: true } },
      },
    });
  }
}
