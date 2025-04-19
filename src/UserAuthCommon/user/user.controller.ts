import { Controller, Body, Patch, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
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
    return this.userService.editProfileData(request.userId, updateUserDto);
  }

  @UseGuards(AuthGuard)
  @Patch('passw')
  async changePassword(
    @Req() request: RequestWithUser,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.userService.changePassword(request.userId, changePasswordDto);
  }
}
