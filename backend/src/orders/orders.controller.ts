import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.CASHIER)
  findAll() {
    return this.ordersService.findAll();
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.CASHIER)
  create(
    @CurrentUser() user: { sub: string },
    @Body() createOrderDto: CreateOrderDto,
  ) {
    return this.ordersService.create(user.sub, createOrderDto);
  }
}
