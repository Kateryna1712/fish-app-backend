import { IsEmail, IsNumber, IsString } from 'class-validator';

export class CreateCustomerDto {
  @IsEmail()
  email: string;

  @IsString()
  name: string;
}
