import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Subscription } from 'src/pricing-plans/entities/subscription.entity';
import { User } from 'src/UserAuthCommon/user/entities/user.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class SubscriptionGuardService {
  private logger = new Logger(SubscriptionGuardService.name);

  private userRepository: Repository<User>;
  private subscrRepository: Repository<Subscription>;

  constructor(private dataSource: DataSource) {
    this.userRepository = this.dataSource.getRepository(User);
    this.subscrRepository = this.dataSource.getRepository(Subscription);
  }
  async hasRequiredSubscr(userId: string, requiredSubscrtype: string[]) {
    const subscr = await this.subscrRepository
      .findOne({
        where: {
          user: { id: userId },
        },
      })
      .catch((err) => {
        this.logger.error(err);
        throw new InternalServerErrorException(
          'Unexpected error while handle subscription',
        );
      });

    const now = new Date();
    const isExpired = subscr.currentPeriodEnd < now;

    if (isExpired) {
      await this.subscrRepository.update(
        { id: subscr.id },
        { status: 'expired' },
      );
      throw new ForbiddenException('Your subscription is expired');
    }

    if (
      !subscr ||
      subscr.status !== 'active' ||
      !requiredSubscrtype.includes(subscr.type)
    ) {
      throw new ForbiddenException(
        'You need to have a subscription with one of the following types: ' +
          requiredSubscrtype.join(', '),
      );
    }

    return subscr.type;
  }
}
