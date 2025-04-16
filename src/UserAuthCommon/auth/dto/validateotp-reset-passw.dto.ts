import { IsEmail, NotContains, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ValidateOtpResetPasswDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @NotContains(' ')
  otp: string;
}
