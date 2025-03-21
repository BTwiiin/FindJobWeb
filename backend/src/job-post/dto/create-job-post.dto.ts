import { IsString, IsNumber, IsDate, IsEnum, IsNotEmpty, IsOptional, IsObject, Min, Max } from 'class-validator';
import { JobPostCategory } from '../../entities/enums/job-post-category.enum';
import { Transform } from 'class-transformer';

export class LocationDto {
  @IsString()
  @IsNotEmpty()
  country: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  @IsNotEmpty()
  latitude: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  @IsNotEmpty()
  longitude: number;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  postalCode?: string;

  @IsString()
  @IsOptional()
  formattedAddress?: string;
}

export class CreateJobPostDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsNotEmpty()
  paymentAmount: number;

  @IsDate()
  @IsNotEmpty()
  @Transform(({ value }) => new Date(value))
  deadline: Date;

  @IsEnum(JobPostCategory)
  @IsNotEmpty()
  category: JobPostCategory;

  @IsObject()
  @IsNotEmpty()
  location: LocationDto;
} 