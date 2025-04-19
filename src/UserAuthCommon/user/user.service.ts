import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';

import { UpdateUserDto } from './dto/update-user.dto';
import { UserRepository } from './repository/user.repository';
import { User } from './entities/user.entity';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private readonly userRepository: UserRepository) {}

  async isUserExist(id: string): Promise<User> {
    const user = await this.userRepository.findOne(id);

    return user;
  }
  async getMe(userId: string) {
    return this.userRepository.findOne(userId);
  }
  //todo create in repo universal method for getting by id and by email
  async getUserInfoById(userId: string) {
    const user = await this.userRepository.getMe(userId);
    return user;
  }

  async getUserInfoByEmail(email: string) {
    return this.userRepository.findOneByEmail(email);
  }

  async editProfileData(userId: string, updateUserDto: UpdateUserDto) {
    return this.userRepository
      .updateUser(userId, updateUserDto)
      .catch((err) => {
        if (err.code === '23505') {
          throw new BadRequestException('Bad data error');
        }
      });
  }

  async updatePasswReset(authId: string, passwhash: string) {
    return this.userRepository.updatePassw(authId, passwhash);
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.userRepository.findOne(userId, true);
    // if (user.password !== changePasswordDto.oldPassword) {
    // }

    const isAuth = await bcrypt.compare(
      changePasswordDto.oldPassword,
      user.password,
    );

    if (!isAuth) {
      throw new HttpException('Unauthorized.', HttpStatus.UNAUTHORIZED);
    }

    const newPasswHash = await bcrypt.hash(changePasswordDto.newPassword, 10);

    await this.userRepository
      .updateUser(userId, {
        password: newPasswHash,
      })
      .catch((err) => {
        this.logger.error(err);

        throw new InternalServerErrorException(
          'Unexpected error while change password',
        );
      });
  }
}
//--=-=-=-=-err code 23505
