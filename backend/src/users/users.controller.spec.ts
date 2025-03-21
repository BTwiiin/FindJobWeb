import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { ForbiddenException } from '@nestjs/common';
import { Role } from '../entities/enums/role.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

// Mock declarations need to be hoisted
jest.mock('@nestjs/common', () => ({
  ...jest.requireActual('@nestjs/common'),
  UseGuards: jest.fn().mockReturnValue(() => {}),
}));

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn().mockImplementation((context) => {
        const requiredRoles = context.getHandler().getMetadata('roles');
        const user = context.switchToHttp().getRequest().user;
        return requiredRoles.includes(user.role);
      }) })
      .compile();
  
    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);

    // Clear all mock calls before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all users when user is admin', async () => {
      const mockUsers = [
        { id: '1', username: 'user1' },
        { id: '2', username: 'user2' },
      ];
      mockUsersService.findAll.mockResolvedValue(mockUsers);

      // Mock the request with admin user
      const mockReq = { user: { role: Role.ADMIN } };
      const result = await controller.findAll();

      expect(result).toEqual(mockUsers);
      expect(mockUsersService.findAll).toHaveBeenCalled();
    });

    it('should throw ForbiddenException when user is not admin', async () => {
      // Mock the request with non-admin user
      const mockReq = { user: { role: Role.EMPLOYEE } };
      
      try {
        await controller.findAll();
        fail('Expected ForbiddenException but no exception was thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
      }
      
      expect(mockUsersService.findAll).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const mockUser = { id: '1', username: 'user1' };
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await controller.findOne('1');

      expect(result).toEqual(mockUser);
      expect(mockUsersService.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('update', () => {
    it('should update user when user is admin', async () => {
      const mockUser = { id: '1', username: 'user1' };
      const updateUserDto = { username: 'updateduser' };
      mockUsersService.update.mockResolvedValue({ ...mockUser, ...updateUserDto });

      // Mock the request with admin user
      const mockReq = { user: { role: Role.ADMIN } };
      const result = await controller.update('1', updateUserDto);

      expect(result).toEqual({ ...mockUser, ...updateUserDto });
      expect(mockUsersService.update).toHaveBeenCalledWith('1', updateUserDto);
    });

    it('should throw ForbiddenException when user is not admin', async () => {
      const updateUserDto = { username: 'updateduser' };
      
      // Mock the request with non-admin user
      const mockReq = { user: { role: Role.EMPLOYEE } };
      
      try {
        await controller.update('1', updateUserDto);
        fail('Expected ForbiddenException but no exception was thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
      }
      
      expect(mockUsersService.update).not.toHaveBeenCalled();
    });
  });
});