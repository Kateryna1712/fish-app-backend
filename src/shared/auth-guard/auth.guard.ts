import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuardService } from './auth-guard.service';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly jwtAccessSecret: string = process.env.JWT_ACCESS_SECRET;
  constructor(
    private jwtService: JwtService,
    private authGuardService: AuthGuardService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const accessToken = request.cookies.accessToken;
    console.log('-=-=-=-=-=cookies in gvard', request.cookies);

    if (!accessToken) {
      throw new UnauthorizedException('Unauthorized.');
    }
    try {
      const payload = await this.jwtService.verify(accessToken, {
        secret: this.jwtAccessSecret,
      });
      const user = await this.authGuardService.findOne(payload.id);
      console.log('-=-=-=-=-=-=-=user', user);

      request['userId'] = user.id;
      request['email'] = user.email;
    } catch (error) {
      throw new UnauthorizedException('Unauthorized.');
    }
    return true;
  }
}
