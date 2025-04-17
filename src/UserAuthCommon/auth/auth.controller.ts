import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
  HttpException,
  BadRequestException,
} from '@nestjs/common';

import { Response, Request } from 'express';

import { AuthService } from './auth.service';
import {
  ACCESS_TOKEN_COOKIE_OPTIONS,
  REFRESH_TOKEN_COOKIE_OPTIONS,
} from 'src/config/constants';
import {
  RequestWithGoogleUser,
  RequestWithUser,
} from 'src/UserAuthCommon/user/interfaces/user.interfaces';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { UserService } from 'src/UserAuthCommon/user/user.service';
import { GoogleOAuthGuard } from './guards/google-oauth.guard';
import { AuthGuard } from 'src/shared/auth-guard/auth.guard';
import { EmailService } from 'src/3d-party/email/email.service';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ConfirmResetPassw } from './dto/confitm-reset-passw.dto';

@Controller('auth')
export class AuthController {
  private readonly accessTokenCookieOptions: object =
    ACCESS_TOKEN_COOKIE_OPTIONS;
  private readonly refreshTokenCookieOptions: object =
    REFRESH_TOKEN_COOKIE_OPTIONS;

  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Get('google')
  @UseGuards(GoogleOAuthGuard)
  async googleAuth(@Req() req: Request) {}

  @Get('google-callback')
  @UseGuards(GoogleOAuthGuard)
  async googleAuthRedirect(
    @Req() req: RequestWithGoogleUser,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.authService.googleLogin(req);
    const tokens = this.authService.generateTokens(user.id);

    response.cookie(
      'accessToken',
      tokens.accessToken,
      this.accessTokenCookieOptions,
    );

    response.cookie(
      'refreshToken',
      tokens.refreshToken,
      this.refreshTokenCookieOptions,
    );

    response.redirect(
      `fishing://app/login?name=${user.name}/email=${user.email}`,
    );
  }

  @Post('sign-up')
  async signUp(
    @Body() signUpDto: SignUpDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.authService.signUp(signUpDto);
    const tokens = this.authService.generateTokens(user.id);

    response.cookie(
      'accessToken',
      tokens.accessToken,
      this.accessTokenCookieOptions,
    );

    response.cookie(
      'refreshToken',
      tokens.refreshToken,
      this.refreshTokenCookieOptions,
    );
    return user;
  }

  @HttpCode(HttpStatus.OK)
  @Post('sign-in')
  async signIn(
    @Body() signInDto: SignInDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.authService.signIn(signInDto);
    const tokens = this.authService.generateTokens(user.id);

    response.cookie(
      'accessToken',
      tokens.accessToken,
      this.accessTokenCookieOptions,
    );

    response.cookie(
      'refreshToken',
      tokens.refreshToken,
      this.refreshTokenCookieOptions,
    );
    return user;
  }

  // @ApiAuthenticate()
  @UseGuards(AuthGuard)
  @Get('me')
  async authenticate(@Req() request: RequestWithUser) {
    return this.userService.getUserInfoById(request.userId);
  }

  @Get('refresh')
  refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies.refreshToken;

    if (!refreshToken) {
      throw new HttpException(
        'Refresh token does not exist',
        HttpStatus.UNAUTHORIZED,
      );
    }
    const accessToken = this.authService.refresh(refreshToken);

    response.clearCookie('accessToken', this.refreshTokenCookieOptions);

    response.cookie('accessToken', accessToken, this.accessTokenCookieOptions);

    return accessToken;
  }

  // @ApiSignOut()
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @Post('sign-out')
  logOut(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('refreshToken', this.accessTokenCookieOptions);
    response.clearCookie('accessToken', this.refreshTokenCookieOptions);

    return;
  }

  @Post('init-email-verify')
  async initEmailVerify(
    @Body('email') email: string,
  ): Promise<{ message: string }> {
    if (!email) {
      throw new BadRequestException('Email is required');
    }

    return this.authService.initEmailVerify(email);
  }

  @Post('email-verify')
  async confirmEmailVerify(@Body() verifyEmailDto: VerifyEmailDto) {
    if (!verifyEmailDto.otp) {
      throw new BadRequestException('Email is required');
    }

    return this.authService.confirmEmailVerify(verifyEmailDto);
  }

  @Post('reset-password')
  async resetPasswordGenerate(@Body('email') email: string) {
    if (!email) {
      throw new BadRequestException('Email is required');
    }

    return this.authService.resetPasswordGenerate(email);
  }

  // @Get('reset-password/otp')
  // validateResetOtp(@Query('otp') otp: string, @Query('email') email: string) {
  //   console.log('-=-=-=-=-otp', otp, email);
  //   return this.authService.validateResetOtp(otp, email);
  // }

  @Post('confirm-reset-password')
  async confirmResetPassword(@Body() confirmResetPassw: ConfirmResetPassw) {
    return this.authService.confirmResetPassword(confirmResetPassw);
  }
}
