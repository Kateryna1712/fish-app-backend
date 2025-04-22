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
    private readonly mailService: EmailService,
  ) {}

  async googleLogin(req: RequestWithGoogleUser) {
    if (!req.user) {
      throw new UnauthorizedException();
    }
    const userGoogle = req.user;
    let user = await this.userService.getUserInfoByEmail(req.user.email);

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
    }

    return user;
  }

  ///todo move db operation into repository
  async signUp(signUpDto: SignUpDto) {
    try {
      const { password } = signUpDto;

      const userDb = await this.userService.getUserInfoByEmail(signUpDto.email);
      this.logger.debug('-=-=-=-=-user in sign up from db', userDb);
      if (userDb) {
        throw new BadRequestException('User already exists');
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const planFree = await this.planService.findOneByName('free');
      if (!planFree) {
        throw new HttpException(
          'Free plan not found in database',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

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
      this.logger.debug('-=-=-=-=-=plan in sign up', planFree);

      const user = await this.authRepository.createAuthUser(
        {
          ...signUpDto,
          password: passwordHash,
        },
        {
          email: signUpDto.email,
          verified: false,
        },
        createSubscrDto,
      );

      if (!user) {
        throw new HttpException(
          'Failed to create user account',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      // Get the complete user object with relationships
      const completeUser = await this.userService.getUserInfoByEmail(
        user.email,
      );
      if (!completeUser) {
        throw new HttpException(
          'User not found after creation',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const otpCode = this.generateOtpCode();
      const auth = await this.getAuthByEmail(signUpDto.email);

      if (auth) {
        await this.otpRepository.save({
          otp: otpCode,
          expiration: new Date(Date.now() + 10 * 60 * 1000),
          auth: { id: auth.id },
        });

        await this.emailService.sendEmailVerify(signUpDto.email, otpCode);
      }

      delete completeUser.password;
      return completeUser;
    } catch (error) {
      this.logger.error('Error in signUp:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'An error occurred during sign up',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async signIn(signInDto: SignInDto) {
    try {
      const { email, password } = signInDto;

      const userDb = await this.userService.getUserInfoByEmail(email);
      if (!userDb) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const { password: passwordHash, ...user } = userDb;

      const isAuth = await bcrypt.compare(password, passwordHash);
      if (!isAuth) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const auth = await this.getAuthByEmail(email);

      if (!auth.verified) {
        const otpCode = this.generateOtpCode();

        const existingOtp = await this.otpRepository.findOne({
          where: { auth: { id: auth.id } },
        });
        if (existingOtp) {
          await this.otpRepository.delete({ id: existingOtp.id });
        }

        await this.otpRepository.save({
          otp: otpCode,
          expiration: new Date(Date.now() + 10 * 60 * 1000),
          auth: { id: auth.id },
        });

        await this.emailService.sendEmailVerify(email, otpCode);
      }

      return user;
    } catch (error) {
      this.logger.error(error);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new HttpException(
        'An error occurred while signing in.',
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
    if (!auth) {
      throw new BadRequestException('User not found');
    }

    if (auth.verified) {
      throw new BadRequestException('Email is already verified');
    }

    const otpDb = await this.otpRepository.findOne({
      where: { auth: { id: auth.id } },
    });
    if (otpDb && otpDb.expiration > new Date()) {
      return { message: 'Verification code was already send to email' };
    }

    const otpCode = this.generateOtpCode();

    // Delete existing OTP if it exists
    if (otpDb) {
      await this.otpRepository.delete({ id: otpDb.id });
    }

    // Create new OTP
    await this.otpRepository.save({
      otp: otpCode,
      expiration: new Date(Date.now() + 10 * 60 * 1000),
      auth: { id: auth.id },
    });

    await this.emailService.sendEmailVerify(email, otpCode);

    return { message: 'Verification code sent to email' };
  }

  async confirmEmailVerify(verifyEmailDto: VerifyEmailDto) {
    const { otp, email } = verifyEmailDto;

    const auth = await this.getAuthByEmail(email);

    const otpDb = await this.otpRepository.findOne({
      where: { auth: { id: auth.id } },
    });

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
    if (otpPasswDb && otpPasswDb.expiration > new Date()) {
      return { message: 'Reset password code was already send to email' };
    }

    const otpCode = this.generateOtpCode();

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
