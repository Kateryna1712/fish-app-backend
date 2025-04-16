import { Injectable, Logger } from '@nestjs/common';
import { User } from 'src/UserAuthCommon/user/entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { Auth } from '../entities/auth.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Subscription } from 'src/pricing-plans/entities/subscription.entity';
import { CreateSubscriptionDto } from 'src/pricing-plans/dto/create-subscr.dto';

@Injectable()
export class AuthRepository {
  private readonly logger = new Logger(AuthRepository.name);

  constructor(
    private dataSource: DataSource,
    @InjectRepository(Auth)
    private authRepository: Repository<Auth>,
  ) {}

  async findOne(email: string) {
    return this.authRepository.findOne({
      where: { email },
    });
  }

  async createAuthUser(
    userData: Partial<User>,
    authData: Partial<Auth>,
    createSubscrDto: CreateSubscriptionDto,
  ) {
    console.log('-=-=-=-=-=-createSubscrDto'), createSubscrDto;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const subscr = await queryRunner.manager.save(Subscription, {
        ...createSubscrDto,
        plan: { id: createSubscrDto.planId },
      });

      const user = await queryRunner.manager.save(User, {
        ...userData,
        subscriptions: [subscr],
      });

      // user.subscriptions = [subscr];

      // const updUser = await queryRunner.manager.update(User, user.id, {
      //   subscriptions: [subscr],
      // });

      // console.log('-=-=-=-=-=-=-updUser in create user T', updUser);

      await queryRunner.manager.save(Auth, {
        ...authData,
        user,
      });
      console.log('--=-=-=-=-user', user);
      this.logger.debug(user);

      await queryRunner.commitTransaction();

      return user;
    } catch (error) {
      this.logger.error(error);

      await queryRunner.rollbackTransaction();

      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateVerified(authId: string, isVerified: boolean) {
    return this.authRepository.update(authId, { verified: isVerified });
  }
}
