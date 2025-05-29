import { IsDateString, IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @IsDateString()
  dateOfBirth: string;

  @IsString()
  @MinLength(6)
  password: string;
}
