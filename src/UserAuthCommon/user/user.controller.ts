import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RequestWithUser } from './interfaces/user.interfaces';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AuthGuard } from 'src/shared/auth-guard/auth.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard)
  @Patch()
  async editProfileData(
    @Req() request: RequestWithUser,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    console.log('-=-=-=-=-=-=-user id', request.userId);

    console.log('-=-=-=-=-=-=-update user dto', updateUserDto);
    return this.userService.editProfileData(request.userId, updateUserDto);
  }

  @UseGuards(AuthGuard)
  @Patch('passw')
  async changePassword(
    @Req() request: RequestWithUser,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    console.log('-=-=-=-=-=-=-user id', request.userId);

    console.log('-=-=-=-=-=-=-update user dto', changePasswordDto);
    return this.userService.changePassword(request.userId, changePasswordDto);
  }
}
