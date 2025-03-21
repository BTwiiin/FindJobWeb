import { IsString, IsNumber, IsDate, IsEnum, IsOptional, IsObject } from 'class-validator';
import { Transform } from 'class-transformer';
import { JobPostCategory } from '../../entities/enums/job-post-category.enum';
import { LocationDto } from './create-job-post.dto';

export class UpdateJobPostDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  paymentAmount?: number;

  @IsDate()
  @IsOptional()
  @Transform(({ value }) => value ? new Date(value) : undefined)
  deadline?: Date;

  @IsEnum(JobPostCategory)
  @IsOptional()
  category?: JobPostCategory;

  @IsObject()
  @IsOptional()
  location?: LocationDto;
} 