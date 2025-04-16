import { Injectable } from '@nestjs/common';
import { User } from 'src/UserAuthCommon/user/entities/user.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class AuthGuardService {
  private userRepository: Repository<User>;
  constructor(private dataSource: DataSource) {
    this.userRepository = this.dataSource.getRepository(User);
  }
  async findOne(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      select: { id: true, email: true, subscriptions: true },
    });
  }
}
