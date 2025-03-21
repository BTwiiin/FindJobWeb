import { ContactType } from '../../entities/enums/contact-type.enum';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, IsUUID } from 'class-validator';

export class CreateApplicationDto {
  @IsUUID()
  @IsNotEmpty()
  jobPostId: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsPhoneNumber()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  coverLetter?: string;

  @IsEnum(ContactType)
  contactType: ContactType;
} 