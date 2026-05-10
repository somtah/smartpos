import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateProductFormDto } from './dto/create-product-form.dto';
import { UpdateProductFormDto } from './dto/update-product-form.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { productImageMulterOptions } from './product-image-upload';
import { ProductsService } from './products.service';

@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.CASHIER)
  findAll() {
    return this.productsService.findAll();
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('image', productImageMulterOptions))
  create(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() body: CreateProductFormDto,
  ) {
    const imageUrl = file
      ? `/uploads/products/${file.filename}`
      : body.imageUrl?.trim() || undefined;
    return this.productsService.create({
      sku: body.sku,
      name: body.name,
      description: body.description,
      imageUrl,
      price: body.price,
      stock: body.stock,
      isActive: body.isActive ?? true,
    });
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('image', productImageMulterOptions))
  update(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() body: UpdateProductFormDto,
  ) {
    const { imageUrl: formImageUrl, ...rest } = body;
    const patch: UpdateProductDto = { ...rest };
    if (file) {
      patch.imageUrl = `/uploads/products/${file.filename}`;
    } else if (formImageUrl?.trim()) {
      patch.imageUrl = formImageUrl.trim();
    }
    return this.productsService.update(id, patch);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
