import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, StockAction } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.order.findMany({
      include: {
        items: true,
        cashier: { select: { id: true, fullName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(cashierId: string, createOrderDto: CreateOrderDto) {
    const productIds = createOrderDto.items.map((item) => item.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
    });

    if (products.length !== createOrderDto.items.length) {
      throw new BadRequestException('One or more products are invalid');
    }

    const orderNumber = `ORD-${Date.now()}`;
    const productMap = new Map(
      products.map((product) => [product.id, product]),
    );
    let subtotal = new Prisma.Decimal(0);
    const itemsData: Array<{
      productId: string;
      quantity: number;
      unitPrice: Prisma.Decimal;
      lineTotal: Prisma.Decimal;
    }> = [];

    for (const item of createOrderDto.items) {
      const product = productMap.get(item.productId);
      if (!product) throw new BadRequestException('Product not found');
      if (product.stock < item.quantity) {
        throw new BadRequestException(`Insufficient stock for ${product.name}`);
      }

      const unitPrice = new Prisma.Decimal(product.price);
      const lineTotal = unitPrice.mul(item.quantity);
      subtotal = subtotal.add(lineTotal);
      itemsData.push({
        productId: product.id,
        quantity: item.quantity,
        unitPrice,
        lineTotal,
      });
    }

    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          orderNumber,
          cashierId,
          subtotal,
          totalAmount: subtotal,
          items: { create: itemsData },
        },
        include: { items: true },
      });

      for (const line of order.items) {
        const current = await tx.product.findUnique({
          where: { id: line.productId },
        });
        if (!current || current.stock < line.quantity) {
          throw new BadRequestException(
            `Insufficient stock for ${current?.name ?? line.productId}`,
          );
        }
        const next = current.stock - line.quantity;
        await tx.product.update({
          where: { id: line.productId },
          data: { stock: next },
        });
        await tx.stockMovement.create({
          data: {
            productId: line.productId,
            orderId: order.id,
            action: StockAction.SALE,
            quantityDelta: -line.quantity,
            stockAfter: next,
          },
        });
      }

      return order;
    });
  }
}
