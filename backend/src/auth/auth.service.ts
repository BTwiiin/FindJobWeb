import { Inject, Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DataSource, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Role } from '../entities/enums/role.enum';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private userRepository: Repository<User>;
  private jwtService: JwtService;

  constructor(
    @Inject('DATA_SOURCE')
    private dataSource: DataSource,
  ) {
    this.userRepository = this.dataSource.getRepository(User);
    this.jwtService = new JwtService({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    });
  }

  async register(username: string, email: string, password: string, firstName: string, lastName: string, role: string) {
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new UnauthorizedException('User with this email already exists');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({
      username,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: role as Role,
    });
    await this.userRepository.save(user);
    const { password: _, ...result } = user;
    const token = this.jwtService.sign({ 
      id: user.id, 
      email: user.email, 
      role: user.role,
      username: user.username 
    });
    return { ...result, token };
  }

  async createAdmin(username: string, email: string, password: string, firstName: string, lastName: string, adminSecret: string) {
    // Check if the admin secret matches
    if (adminSecret !== process.env.ADMIN_SECRET) {
      throw new ForbiddenException('Invalid admin secret');
    }

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new UnauthorizedException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({
      username,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: Role.ADMIN,
    });
    await this.userRepository.save(user);
    const { password: _, ...result } = user;
    const token = this.jwtService.sign({ 
      id: user.id, 
      email: user.email, 
      role: user.role,
      username: user.username 
    });
    return { ...result, token };
  }

  async login(email: string, password: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const { password: _, ...result } = user;
    const token = this.jwtService.sign({ 
      id: user.id, 
      email: user.email, 
      role: user.role,
      username: user.username 
    });
    return { ...result, token };
  }
} 