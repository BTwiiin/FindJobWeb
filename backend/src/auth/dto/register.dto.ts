import { IsEmail, IsString, IsEnum, MinLength, IsNotEmpty } from 'class-validator';

export enum RegisterRole {
  EMPLOYER = 'employer',
  EMPLOYEE = 'employee',
}

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEnum(RegisterRole, { message: 'Invalid role. Must be either "employer" or "employee"' })
  role: RegisterRole;
} 