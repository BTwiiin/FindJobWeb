import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from '../entities/user.entity';
import { Location } from '../entities/location.entity';
import { Role } from '../entities/enums/role.enum';
import { UnauthorizedException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  const mockUsersService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  // Create mock user first
  const mockUser: Partial<User> = {
    id: '1',
    email: 'test@example.com',
    password: 'hashedPassword',
    role: Role.EMPLOYEE,
    firstName: 'John',
    lastName: 'Doe',
    username: 'johndoe',
    phone: '+1234567890',
    taxNumber: '123456789',
    phoneNumber: '+1234567890',
    about: 'Test user',
    jobPosts: [],
    givenReviews: [],
    receivedReviews: [],
    savedPosts: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Create mock location with reference to mock user
  const mockLocation: Location = {
    id: '1',
    country: 'Test Country',
    city: 'Test City',
    address: 'Test Address',
    latitude: 0,
    longitude: 0,
    state: 'Test State',
    postalCode: '12345',
    formattedAddress: 'Test Formatted Address',
    user: mockUser as User,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Complete mock user by adding location
  const completeMockUser: User = {
    ...mockUser,
    location: mockLocation,
  } as User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all users when called by admin', async () => {
      const users = [completeMockUser];
      mockUsersService.findAll.mockResolvedValue(users);

      const result = await controller.findAll();

      expect(result).toEqual(users);
      expect(mockUsersService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single user by id', async () => {
      mockUsersService.findOne.mockResolvedValue(completeMockUser);

      const result = await controller.findOne('1');

      expect(result).toEqual(completeMockUser);
      expect(mockUsersService.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('update', () => {
    it('should update a user when called by admin', async () => {
      const updateData = {
        firstName: 'Jane',
        lastName: 'Smith',
      };
      const updatedUser = { ...completeMockUser, ...updateData };
      mockUsersService.update.mockResolvedValue(updatedUser);

      const result = await controller.update('1', updateData);

      expect(result).toEqual(updatedUser);
      expect(mockUsersService.update).toHaveBeenCalledWith('1', updateData);
    });
  });
});
