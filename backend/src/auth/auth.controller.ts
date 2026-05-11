import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { RefreshTokenDto } from './dto/refresh-token.dto';
// import { LoginDto } from './dto/login.dto';
// import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // --- Login / register / refresh ปิดชั่วคราว (เปิดกลับเมื่อต้องการให้สมัครและล็อกอินผ่าน API) ---
  /*
  @Public()
  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('refresh')
  refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refresh(refreshTokenDto.refreshToken);
  }
  */

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('logout')
  logout(@CurrentUser() user: { sub: string }, @Body() body: RefreshTokenDto) {
    return this.authService.logout(user.sub, body.refreshToken);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CASHIER)
  @Get('me')
  me(@CurrentUser() user: { sub: string; email: string; role: UserRole }) {
    return user;
  }
}
