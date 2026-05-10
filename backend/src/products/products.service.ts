import { Injectable, NotFoundException } from '@nestjs/common';
import { StockAction } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
  }

  findOne(id: string) {
    return this.prisma.product.findUnique({ where: { id } });
  }

  async create(createProductDto: CreateProductDto) {
    const product = await this.prisma.product.create({
      data: createProductDto,
    });
    await this.prisma.stockMovement.create({
      data: {
        productId: product.id,
        action: StockAction.CREATE,
        quantityDelta: product.stock,
        stockAfter: product.stock,
      },
    });
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const exists = await this.findOne(id);
    if (!exists) throw new NotFoundException('Product not found');
    const updated = await this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });
    if (
      updateProductDto.stock !== undefined &&
      updateProductDto.stock !== exists.stock
    ) {
      await this.prisma.stockMovement.create({
        data: {
          productId: id,
          action: StockAction.ADJUSTMENT,
          quantityDelta: updateProductDto.stock - exists.stock,
          stockAfter: updateProductDto.stock,
        },
      });
    }
    return updated;
  }

  async remove(id: string) {
    const exists = await this.findOne(id);
    if (!exists) throw new NotFoundException('Product not found');
    await this.prisma.product.delete({ where: { id } });
    return { success: true };
  }
}
