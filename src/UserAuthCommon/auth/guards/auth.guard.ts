// import {
//   CanActivate,
//   ExecutionContext,
//   Injectable,
//   UnauthorizedException,
// } from '@nestjs/common';
// import { JwtService } from '@nestjs/jwt';
// import { AuthService } from '../auth.service';

// @Injectable()
// export class AuthGuard implements CanActivate {
//   private readonly jwtAccessSecret: string = process.env.JWT_ACCESS_SECRET;
//   constructor(
//     private jwtService: JwtService,
//     private authService: AuthService,
//   ) {}

//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const request = context.switchToHttp().getRequest();
//     const accessToken = request.cookies.accessToken;
//     console.log('-=-=-=-=-=cookies in gvard', request.cookies);

//     if (!accessToken) {
//       throw new UnauthorizedException('Unauthorized.');
//     }
//     try {
//       const payload = await this.jwtService.verify(accessToken, {
//         secret: this.jwtAccessSecret,
//       });
//       const user = await this.authService.isUserExist(payload.id);

//       request['userId'] = user.id;
//     } catch (error) {
//       throw new UnauthorizedException('Unauthorized.');
//     }
//     return true;
//   }
// }
