import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';

import * as otpGenerator from 'otp-generator';

import { UserService } from 'src/UserAuthCommon/user/user.service';
import { SignUpDto } from './dto/sign-up.dto';
import { DataSource, Repository } from 'typeorm';
import { Auth } from './entities/auth.entity';
import { User } from 'src/UserAuthCommon/user/entities/user.entity';
import { SignInDto } from './dto/sign-in.dto';
import { RequestWithGoogleUser } from 'src/UserAuthCommon/user/interfaces/user.interfaces';
import { AuthRepository } from './repositories/auth.repository';
import { PlanService } from 'src/pricing-plans/plan.service';
import { CreateSubscriptionDto } from 'src/pricing-plans/dto/create-subscr.dto';
import { EmailService } from 'src/3d-party/email/email.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Otp } from './entities/otp.entity';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { OtpPassw } from './entities/otpPassw.entity';
import { ConfirmResetPassw } from './dto/confitm-reset-passw.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  private readonly jwtAccessSecret: string = process.env.JWT_ACCESS_SECRET;
  private readonly jwtRefreshSecret: string = process.env.JWT_REFRESH_SECRET;

  constructor(
    private dataSource: DataSource,
    private readonly authRepository: AuthRepository,
    private readonly userService: UserService,
    private readonly planService: PlanService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    @InjectRepository(Otp)
    private otpRepository: Repository<Otp>,
    @InjectRepository(OtpPassw)
    private otpPasswRepository: Repository<OtpPassw>,
  ) {}

  async googleLogin(req: RequestWithGoogleUser) {
    if (!req.user) {
      throw new UnauthorizedException();
    }
    const userGoogle = req.user;
    console.log('-=-=-=-=-user in google auth', req.user);
    // const fAuth = await this.authRepository.findOne(req.user.email);
    let user = await this.userService.getUserInfoByEmail(req.user.email);
    console.log('-=-=-=-=-user in google login from db', user);

    const planFree = await this.planService.findOneByName('free');
    const createSubscrDto: CreateSubscriptionDto = {
      planId: planFree.id,
      stripeSubscriptionId: '0',
      stripeCustomerId: '0',
      status: 'active',
      type: planFree.name,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(
        new Date().setMonth(new Date().getMonth() + 1),
      ),
    };
    console.log('-=-=-=-=-=planFree in google login', planFree);

    if (!user) {
      user = await this.authRepository.createAuthUser(
        {
          name: userGoogle.firstName,
          email: userGoogle.email,
          password: 'google',
        },

        {
          email: userGoogle.email,
          method: 'google',
          token: userGoogle.accessToken,
        },
        createSubscrDto,
      );
      console.log('-=-=-=-=-user in google login created', user);
    }

    return user;
  }

  ///todo move db operation into repository
  async signUp(signUpDto: SignUpDto) {
    const { password } = signUpDto;

    const userDb = await this.userService.getUserInfoByEmail(signUpDto.email);
    console.log('-=-=-=-=-user in google login from db', userDb);
    if (userDb) {
      throw new BadRequestException('Bad user data');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const planFree = await this.planService.findOneByName('free');
    const createSubscrDto: CreateSubscriptionDto = {
      planId: planFree.id,
      stripeSubscriptionId: '0',
      stripeCustomerId: '0',
      status: 'active',
      type: planFree.name,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(
        new Date().setMonth(new Date().getMonth() + 1),
      ),
    };
    console.log('-=-=-=-=-=plan in sign up', planFree);

    const user = await this.authRepository.createAuthUser(
      {
        ...signUpDto,
        password: passwordHash,
      },

      {
        email: signUpDto.email,
      },
      createSubscrDto,
    );
    delete user.password;
    console.log('-=-=-=-=-user in sign up created', user);
    return user;
  }

  async signIn(signInDto: SignInDto) {
    try {
      const { email, password } = signInDto;

      const userDb = await this.userService.getUserInfoByEmail(email);
      console.log('-=-=-=-=-userDb in sign in', userDb);

      if (!userDb) {
        throw new UnauthorizedException();
      }

      const { password: passwordHash, ...user } = userDb;
      console.log('-=-=-=-=-=-user in sign in', user);

      const isAuth = await bcrypt.compare(password, passwordHash);

      if (!isAuth) {
        throw new HttpException('Unauthorized.', HttpStatus.UNAUTHORIZED);
      }

      return user;
    } catch (error) {
      this.logger.error(error);
      if (error.status === HttpStatus.UNAUTHORIZED) {
        throw new HttpException(error.message, error.status);
      }

      if (error.status === HttpStatus.BAD_REQUEST) {
        throw new HttpException(error.message, error.status);
      }

      throw new HttpException(
        'An error occurred while sign in.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  generateTokens(id: string) {
    const accessToken = this.jwtService.sign(
      { id },
      { expiresIn: '24h', secret: this.jwtAccessSecret },
    );
    const refreshToken = this.jwtService.sign(
      { id },
      { expiresIn: '24h', secret: this.jwtRefreshSecret },
    );
    return { accessToken, refreshToken };
  }

  refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.jwtRefreshSecret,
      });
      const id = payload.id;
      const accessToken = this.jwtService.sign(
        { id },
        { expiresIn: '1h', secret: this.jwtAccessSecret },
      );

      return accessToken;
    } catch (error) {
      throw new HttpException('Token was not verify', HttpStatus.UNAUTHORIZED);
    }
  }

  async isUserExist(userId: string): Promise<User> {
    try {
      return this.userService.isUserExist(userId);
    } catch (error) {
      throw new HttpException(
        'An error occurred while check user.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async initEmailVerify(email: string): Promise<{ message: string }> {
    const auth = await this.getAuthByEmail(email);
    console.log('-=-=-=-=-=auth', auth);
    if (!auth) {
      throw new BadRequestException('User not found');
    }

    if (auth.verified) {
      throw new BadRequestException('Email is already verified');
    }

    const otpDb = await this.otpRepository.findOne({
      where: { auth: { id: auth.id } },
    });
    console.log('-=-=-=-=-=-=-otpDb', otpDb);
    if (otpDb && otpDb.expiration > new Date()) {
      return { message: 'Verification code was already send to email' };
    }

    const otpCode = this.generateOtpCode();

    await this.otpRepository.upsert(
      { otp: otpCode, expiration: new Date(Date.now() + 10 * 60 * 1000), auth },
      ['auth'],
    );

    await this.emailService.sendEmailVerify(email, otpCode);

    return { message: 'Verification code sent to email' };
  }

  async confirmEmailVerify(verifyEmailDto: VerifyEmailDto) {
    const { otp, email } = verifyEmailDto;

    const auth = await this.getAuthByEmail(email);
    console.log('-=-=-=-=-=auth', auth);

    const otpDb = await this.otpRepository.findOne({
      where: { auth: { id: auth.id } },
    });
    console.log('-=-=-=-=-=-=-otpDb', otpDb);

    if (!otpDb) {
      throw new ForbiddenException(
        'The code is wrong or the time to use it has expired. Please request the new one.',
      );
    }

    if (!auth) {
      throw new BadRequestException('User not found');
    }

    if (auth.verified) {
      throw new BadRequestException('Email is already verified');
    }

    if (otpDb.expiration < new Date()) {
      await this.otpRepository.delete({ id: otpDb.id });

      throw new ForbiddenException(
        'The code is wrong or the time to use it has expired. Please request the new one.',
      );
    }

    const isValidOtp = otp === otpDb.otp;

    if (!isValidOtp) {
      throw new ForbiddenException(
        'The code is wrong or the time to use it has expired. Please request the new one.',
      );
    }

    await this.otpRepository.delete({ id: otpDb.id });

    await this.authRepository.updateVerified(auth.id, true);

    return { message: 'Successfuly verified' };
  }

  async resetPasswordGenerate(email: string) {
    const auth = await this.getAuthByEmail(email);
    if (!auth) {
      throw new BadRequestException('Bad data');
    }

    const otpPasswDb = await this.otpPasswRepository.findOne({
      where: { auth: { id: auth.id } },
    });
    console.log('-=-=-=-=-=-=-otpPasswDb', otpPasswDb);
    if (otpPasswDb && otpPasswDb.expiration > new Date()) {
      return { message: 'Reset password code was already send to email' };
    }

    const otpCode = this.generateOtpCode();

    console.log('-=-=-=-=-=- now', new Date(Date.now()));
    console.log('-=-=-=-=-=- exp', new Date(Date.now() + 10 * 60 * 1000));

    await this.otpPasswRepository.upsert(
      { otp: otpCode, expiration: new Date(Date.now() + 10 * 60 * 1000), auth },
      ['auth'],
    );

    await this.emailService.sendEmailResetPassword(email, otpCode);

    return { message: 'Сode sent to email' };
  }

  async confirmResetPassword(confirmResetPassw: ConfirmResetPassw) {
    const otpDb = await this.otpPasswRepository.findOne({
      where: { auth: { email: confirmResetPassw.email } },
    });

    await this.validateResetOtp(
      otpDb,
      confirmResetPassw.otp,
      confirmResetPassw.email,
    );

    if (confirmResetPassw.newPassword !== confirmResetPassw.repNewPassword) {
      throw new ForbiddenException('Passwords do not match');
    }

    const auth = await this.authRepository.findOne(confirmResetPassw.email);
    if (!auth) {
      throw new BadRequestException('Bad data');
    }

    const passwordHash = await bcrypt.hash(confirmResetPassw.newPassword, 10);

    await this.userService.updatePasswReset(auth.id, passwordHash);

    await this.otpPasswRepository.delete({ id: otpDb.id });
  }

  async getAuthByEmail(email: string) {
    return this.authRepository.findOne(email);
  }

  async validateResetOtp(otpDb: OtpPassw, otp: string, email: string) {
    console.log('-=-=-=-=-=-=-otp', otp);

    console.log('-=-=-=-=-=-=-otpDb', otpDb);

    if (
      !otpDb ||
      !otpDb.otp ||
      otpDb.expiration < new Date() ||
      otp !== otpDb.otp
    ) {
      throw new ForbiddenException(
        'The code is wrong or the time to use it has expired. Please request the new one.',
      );
    }
  }

  generateOtpCode() {
    return otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
  }
}
