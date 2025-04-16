import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class InviteFriendDto {
  @ApiProperty()
  @IsEmail()
  email: string;
}
