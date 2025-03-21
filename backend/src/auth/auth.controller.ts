import { Controller, Post, Body, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { CreateAdminDto } from './dto/create-admin.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @UsePipes(new ValidationPipe({ transform: true }))
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(
      registerDto.username,
      registerDto.email,
      registerDto.password,
      registerDto.firstName,
      registerDto.lastName,
      registerDto.role,
    );
  }

  @Post('create-admin')
  @UsePipes(new ValidationPipe({ transform: true }))
  async createAdmin(@Body() createAdminDto: CreateAdminDto) {
    return this.authService.createAdmin(
      createAdminDto.username,
      createAdminDto.email,
      createAdminDto.password,
      createAdminDto.firstName,
      createAdminDto.lastName,
      createAdminDto.adminSecret,
    );
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }
} 