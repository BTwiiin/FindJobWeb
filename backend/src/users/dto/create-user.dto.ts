import { IsString, IsEmail, IsEnum, IsOptional, Matches, Length, ValidateIf } from 'class-validator';
import { Role } from '../../entities/enums/role.enum';

export class CreateUserDto {
  @IsString()
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsEnum(Role)
  role: Role;

  @IsOptional()
  @ValidateIf((o) => o.role === Role.EMPLOYER)
  @IsString()
  @Matches(/^\d{12}$/, { message: 'ИНН должен содержать ровно 12 цифр' })
  @Length(12, 12, { message: 'ИНН должен содержать ровно 12 цифр' })
  taxNumber?: string;
} 