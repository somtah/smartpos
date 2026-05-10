import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async create(data: {
    email: string;
    fullName: string;
    passwordHash: string;
    role?: UserRole;
  }) {
    return this.prisma.user.create({
      data: {
        email: data.email,
        fullName: data.fullName,
        passwordHash: data.passwordHash,
        role: data.role ?? UserRole.CASHIER,
      },
    });
  }

  async createFromDto(createUserDto: CreateUserDto) {
    const passwordHash = await bcrypt.hash(createUserDto.password, 10);
    return this.create({ ...createUserDto, passwordHash });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const exists = await this.findById(id);
    if (!exists) throw new NotFoundException('User not found');
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: string) {
    const exists = await this.findById(id);
    if (!exists) throw new NotFoundException('User not found');
    await this.prisma.user.delete({ where: { id } });
    return { success: true };
  }
}
