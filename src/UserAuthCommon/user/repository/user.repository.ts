import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(
    id: string,
    selectPassw: boolean = false,
  ): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      select: selectPassw ? { password: true } : null,
    });
  }

  async getMe(id: string): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .innerJoinAndSelect('user.auth', 'auth')
      .leftJoinAndSelect('user.subscriptions', 'subscription')
      .leftJoinAndSelect('subscription.plan', 'plan')
      .where('user.id = :id', { id })
      .select([
        'user.id',
        'user.name',
        'user.email',
        'auth.verified',
        'subscription.id',
        'plan.id',
        'plan.name',
        'plan.price',
        'plan.description',
        'plan.permission',
      ])
      .getOne();
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      select: { id: true, name: true, email: true, password: true },
    });
  }

  async updateUser(id: string, data: Partial<User>) {
    return this.userRepository.update(id, data);
  }

  async remove(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }

  async updatePassw(authId: string, passwhash: string) {
    const user = await this.userRepository.findOne({
      where: { auth: { id: authId } },
    });

    if (!user) {
      throw new BadRequestException('Bad data');
    }

    return this.userRepository.update({ id: user.id }, { password: passwhash });
  }
}
