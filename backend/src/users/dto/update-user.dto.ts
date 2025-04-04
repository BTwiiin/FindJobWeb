import { IsOptional, IsString, IsObject } from "class-validator";
import { Location } from "src/entities/location.entity";

export class UpdateUserDto {
    @IsString()
    @IsOptional()
    phoneNumber: string;

    @IsObject()
    @IsOptional()
    location: Location;

    @IsString()
    @IsOptional()
    about: string;
}
