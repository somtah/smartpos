import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
// import { LoginDto } from './dto/login.dto';
// import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /*
  async register(registerDto: RegisterDto) {
    const existing = await this.usersService.findByEmail(registerDto.email);
    if (existing) throw new UnauthorizedException('Email already used');

    const passwordHash = await this.hashValue(registerDto.password);
    const user = await this.usersService.create({
      email: registerDto.email,
      fullName: registerDto.fullName,
      passwordHash,
      role: registerDto.role ?? UserRole.CASHIER,
    });

    return this.issueTokens(user);
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(loginDto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');
    return this.issueTokens(user);
  }

  async refresh(refreshToken: string) {
    const payload = await this.jwtService.verifyAsync<{
      sub: string;
      email: string;
      role: UserRole;
    }>(refreshToken, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
    });

    const tokens = await this.prisma.refreshToken.findMany({
      where: { userId: payload.sub, revokedAt: null },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });
    if (!tokens.length)
      throw new UnauthorizedException('Refresh token not found');

    let token:
      | ({
          user: User;
        } & {
          id: string;
          tokenHash: string;
          expiresAt: Date;
        })
      | undefined;
    for (const candidate of tokens) {
      const matched = await bcrypt.compare(refreshToken, candidate.tokenHash);
      if (matched) {
        token = candidate;
        break;
      }
    }
    if (!token) throw new UnauthorizedException('Invalid refresh token');
    if (token.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    await this.prisma.refreshToken.update({
      where: { id: token.id },
      data: { revokedAt: new Date() },
    });

    return this.issueTokens(token.user);
  }
  */

  async logout(userId: string, refreshToken: string) {
    const tokens = await this.prisma.refreshToken.findMany({
      where: { userId, revokedAt: null },
    });
    if (!tokens.length) throw new NotFoundException('No active token');

    for (const token of tokens) {
      const matched = await bcrypt.compare(refreshToken, token.tokenHash);
      if (matched) {
        await this.prisma.refreshToken.update({
          where: { id: token.id },
          data: { revokedAt: new Date() },
        });
        return { success: true };
      }
    }

    throw new UnauthorizedException('Invalid refresh token');
  }

  private async issueTokens(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN', '15m'),
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
    });

    const refreshTokenHash = await this.hashValue(refreshToken);
    const refreshExpiresIn = this.configService.get<string>(
      'JWT_REFRESH_EXPIRES_IN',
      '7d',
    );
    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: refreshTokenHash,
        expiresAt: this.toDateFromDuration(refreshExpiresIn),
      },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }

  private async hashValue(value: string) {
    const saltRoundsValue = this.configService.get<string>(
      'BCRYPT_SALT_ROUNDS',
      '10',
    );
    const saltRounds = Number.parseInt(saltRoundsValue, 10);
    const rounds = Number.isNaN(saltRounds) ? 10 : saltRounds;
    return bcrypt.hash(value, rounds);
  }

  private toDateFromDuration(duration: string): Date {
    const now = Date.now();
    const match = duration.match(/^(\d+)([smhd])$/);
    if (!match) return new Date(now + 7 * 24 * 60 * 60 * 1000);
    const amount = Number(match[1]);
    const unit = match[2];
    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };
    return new Date(now + amount * multipliers[unit]);
  }
}
