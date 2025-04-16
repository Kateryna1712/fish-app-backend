import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class ChangePasswordDto {
  @ApiProperty({ example: '123456' })
  @IsString()
  @Transform(({ value }) => value?.trim())
  oldPassword: string;

  @ApiProperty({ example: '234567' })
  @IsString()
  @Transform(({ value }) => value?.trim())
  newPassword: string;
}
