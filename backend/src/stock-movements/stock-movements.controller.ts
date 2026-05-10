import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { StockMovementsService } from './stock-movements.service';

@Controller('stock-movements')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StockMovementsController {
  constructor(private readonly stockMovementsService: StockMovementsService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.CASHIER)
  findRecent(@Query('limit') limit?: string) {
    const n = limit ? parseInt(limit, 10) : 50;
    return this.stockMovementsService.findRecent(Number.isFinite(n) ? n : 50);
  }
}
