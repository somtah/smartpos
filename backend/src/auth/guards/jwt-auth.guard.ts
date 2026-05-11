import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '../../prisma/prisma.service';

/** สอดคล้องกับ frontend authMode: ปิดเว้นแต่ตั้ง DISABLE_AUTH=false|0 จะบังคับ JWT */
function isAuthBypassEnabled(): boolean {
  const v = process.env.DISABLE_AUTH;
  if (v === 'false' || v === '0') return false;
  return true;
}

/** เมื่อเปิด bypass จะใช้ user admin@smartpos.local จาก seed */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (isAuthBypassEnabled()) {
      const req = context.switchToHttp().getRequest();
      const user = await this.prisma.user.findUnique({
        where: { email: 'admin@smartpos.local' },
      });
      if (!user) {
        throw new UnauthorizedException(
          'DISABLE_AUTH is set but admin@smartpos.local was not found; run prisma db seed',
        );
      }
      req.user = {
        sub: user.id,
        email: user.email,
        role: user.role,
      };
      return true;
    }
    return super.canActivate(context) as Promise<boolean>;
  }
}
