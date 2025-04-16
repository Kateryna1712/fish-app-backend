import { IsString, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignUpDto {
  @ApiProperty({ example: 'Ben' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'ben228@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  password: string;
}
