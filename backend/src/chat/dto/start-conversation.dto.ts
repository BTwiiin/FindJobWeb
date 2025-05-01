import { IsString, IsNotEmpty } from 'class-validator';

export class StartConversationDto {
  @IsString()
  @IsNotEmpty()
  targetUserId: string;
}