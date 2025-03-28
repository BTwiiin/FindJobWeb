import { IsEmail, IsString, IsEnum, MinLength, IsNotEmpty, ValidateIf, Matches, Length, IsOptional } from 'class-validator';

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

  @IsOptional()
  @ValidateIf((o) => o.role === RegisterRole.EMPLOYER)
  @IsString()
  @Matches(/^\d{12}$/, { message: 'ИНН должен содержать ровно 12 цифр' })
  @Length(12, 12, { message: 'ИНН должен содержать ровно 12 цифр' })
  taxNumber?: string;
} 