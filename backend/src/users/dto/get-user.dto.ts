import { Role } from "src/entities/enums/role.enum";
import { Location } from "src/entities/location.entity";
import { Review } from "src/entities/review.entity";

export class GetUserDto {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    about: string;
    location: Location;
    role: Role;
    createdAt: Date;
    reviews: Review[];
}
