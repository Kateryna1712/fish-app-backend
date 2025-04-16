import { IsString, IsEmail, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ example: 'Ben' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'ben228@gmail.com' })
  @IsOptional()
  @IsEmail()
  email?: string;
}
