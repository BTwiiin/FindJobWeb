import { IsString, IsDate, IsEnum, IsUUID, IsOptional } from 'class-validator';
import { EventType } from '../calendar.entity';

export class CreateCalendarEventDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  eventDate: string;

  @IsEnum(EventType)
  type: EventType;

  @IsUUID()
  @IsOptional()
  jobPostId?: string;

  @IsOptional()
  @IsUUID()
  userId?: string;
} 