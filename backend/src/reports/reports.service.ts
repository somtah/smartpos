import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async sales(from?: string, to?: string) {
    const startDate = from
      ? new Date(from)
      : new Date(Date.now() - 24 * 60 * 60 * 1000);
    const endDate = to ? new Date(to) : new Date();

    const result = await this.prisma.order.aggregate({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: { _all: true },
      _sum: { totalAmount: true },
      _avg: { totalAmount: true },
    });

    return {
      from: startDate,
      to: endDate,
      ordersCount: result._count._all,
      totalSales: Number(result._sum.totalAmount ?? new Prisma.Decimal(0)),
      averageOrderValue: Number(
        result._avg.totalAmount ?? new Prisma.Decimal(0),
      ),
    };
  }
}
