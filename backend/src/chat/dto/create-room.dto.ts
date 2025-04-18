import { IsString , IsNotEmpty, IsBoolean} from "class-validator";

export class CreateRoomDto {
    @IsString()
    @IsNotEmpty()
    name: string;
  
    @IsString()
    description: string;
  
    @IsBoolean()
    isPrivate: boolean;
  }