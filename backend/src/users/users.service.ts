import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { GetUserDto } from './dto/get-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Location } from '../entities/location.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Location)
    private locationRepository: Repository<Location>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOneByUsername(username: string): Promise<GetUserDto> {
    const user = await this.usersRepository.findOne({ 
      where: { username },
      relations: ['location']
    });
    
    if (!user) {
      throw new NotFoundException(`User with username ${username} not found`);
    }

    console.log("user.location", user.location);

    const userDto: GetUserDto = {
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phoneNumber,
      about: user.about,
      location: user.location,
      role: user.role,
      createdAt: user.createdAt,
      reviews: user.receivedReviews,
    };

    return userDto;
  }

  async findOneById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user;
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(userData);
    return this.usersRepository.save(user);
  }

  async update(id: string, userData: UpdateUserDto, userId: string): Promise<User> {
    const user = await this.findOneById(id);
    if (user.id !== userId) {
      throw new ForbiddenException('You are not allowed to update this user');
    }

    // Handle location update if provided
    if (userData.location) {
      // Check if user already has a location
      let existingLocation = user.location;
      
      if (existingLocation) {
        // Update existing location
        await this.locationRepository.update(existingLocation.id, {
          country: userData.location.country,
          city: userData.location.city,
          street: userData.location.street,
          latitude: userData.location.latitude,
          longitude: userData.location.longitude,
          state: userData.location.state,
          postalCode: userData.location.postalCode,
          formattedAddress: userData.location.formattedAddress
        });
      } else {
        // Create new location
        const newLocation = this.locationRepository.create({
          country: userData.location.country,
          city: userData.location.city,
          street: userData.location.street,
          latitude: userData.location.latitude,
          longitude: userData.location.longitude,
          state: userData.location.state,
          postalCode: userData.location.postalCode,
          formattedAddress: userData.location.formattedAddress,
          user: user
        });
        
        await this.locationRepository.save(newLocation);
      }
    }

    // Update other fields
    const updateData: Partial<User> = {};
    if (userData.phoneNumber) updateData.phoneNumber = userData.phoneNumber;
    if (userData.about) updateData.about = userData.about;

    // Only perform the update if there are fields to update
    if (Object.keys(updateData).length > 0) {
      await this.usersRepository.update(id, updateData);
    }

    // Return the updated user with location
    const updatedUser = await this.usersRepository.findOne({
      where: { id },
      relations: ['location']
    });
    
    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    return updatedUser;
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOneById(id);
    await this.usersRepository.remove(user);
  }

  async searchUsers(query: string): Promise<User[]> {
    return this.usersRepository.createQueryBuilder('user')
      .select(['user.id', 'user.username'])
      .where('LOWER(user.username) LIKE LOWER(:query)', { query: `%${query}%` })
      .limit(10)
      .getMany();
  }
} 