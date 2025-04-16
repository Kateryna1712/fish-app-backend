import { IsEmail, NotContains, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConfirmResetPassw {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @NotContains(' ')
  otp: string;

  @ApiProperty()
  @IsString()
  @NotContains(' ')
  newPassword: string;

  @ApiProperty()
  @IsString()
  @NotContains(' ')
  repNewPassword: string;
}
