import { Injectable, UnauthorizedException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Token, TokenType } from '../entities/token.entity';
import { Role } from '../entities/enums/role.enum';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { MailerService } from '../mailer/mailer.service';
import { VerificationTokenService } from './verification-token.service';
import { MoreThan } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Token)
    private tokenRepository: Repository<Token>,
    private jwtService: JwtService,
    private mailerService: MailerService,
    private verificationTokenService: VerificationTokenService,
  ) {}

  async register(username: string, email: string, password: string, firstName: string, lastName: string, role: string) {
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new UnauthorizedException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = this.verificationTokenService.generateToken();
    const verificationTokenExpires = this.verificationTokenService.getExpiryDate();

    const user = this.userRepository.create({
      username,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: role as Role,
      emailVerified: false,
    });

    await this.userRepository.save(user);

    // Create verification token
    const token = this.tokenRepository.create({
      token: verificationToken,
      type: TokenType.EMAIL_VERIFICATION,
      expiresAt: verificationTokenExpires,
      user,
    });
    await this.tokenRepository.save(token);

    // Send verification email
    await this.mailerService.sendVerificationEmail(email, verificationToken);

    const { password: _, ...result } = user;
    return result;
  }

  async verifyEmail(token: string) {
    const verificationToken = await this.tokenRepository.findOne({
      where: {
        token,
        type: TokenType.EMAIL_VERIFICATION,
        expiresAt: MoreThan(new Date()),
      },
      relations: ['user'],
    });

    if (!verificationToken) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    // Update user
    verificationToken.user.emailVerified = true;
    await this.userRepository.save(verificationToken.user);

    // Delete the used token
    await this.tokenRepository.remove(verificationToken);

    return { message: 'Email verified successfully' };
  }

  async resendVerificationEmail(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    // Delete any existing verification tokens
    await this.tokenRepository.delete({
      user: { id: user.id },
      type: TokenType.EMAIL_VERIFICATION,
    });

    // Generate new verification token
    const verificationToken = this.verificationTokenService.generateToken();
    const verificationTokenExpires = this.verificationTokenService.getExpiryDate();

    // Create new token
    const token = this.tokenRepository.create({
      token: verificationToken,
      type: TokenType.EMAIL_VERIFICATION,
      expiresAt: verificationTokenExpires,
      user,
    });
    await this.tokenRepository.save(token);

    // Send new verification email
    await this.mailerService.sendVerificationEmail(email, verificationToken);

    return { message: 'Verification email sent successfully' };
  }

  async createAdmin(username: string, email: string, password: string, firstName: string, lastName: string, adminSecret: string) {
    if (adminSecret !== process.env.ADMIN_SECRET) {
      throw new ForbiddenException('Invalid admin secret');
    }

    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new UnauthorizedException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = this.verificationTokenService.generateToken();
    const verificationTokenExpires = this.verificationTokenService.getExpiryDate();

    const user = this.userRepository.create({
      username,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: Role.ADMIN,
      emailVerified: false,
    });

    await this.userRepository.save(user);

    // Create verification token
    const token = this.tokenRepository.create({
      token: verificationToken,
      type: TokenType.EMAIL_VERIFICATION,
      expiresAt: verificationTokenExpires,
      user,
    });
    await this.tokenRepository.save(token);

    // Send verification email
    await this.mailerService.sendVerificationEmail(email, verificationToken);

    const { password: _, ...result } = user;
    return result;
  }

  async login(email: string, password: string) {
    const user = await this.userRepository.findOne({ where: { email }, relations: ['location'] });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.emailVerified) {
      throw new UnauthorizedException('Email not verified');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password: _, ...result } = user;
    const token = this.jwtService.sign({ 
      id: user?.id, 
      email: user.email, 
      role: user.role,
      username: user.username 
    });
  
    
    return { ...result, token };
  }

  async forgotPassword(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    
    // Delete any existing password reset tokens
    await this.tokenRepository.delete({
      user: { id: user.id },
      type: TokenType.PASSWORD_RESET,
    });

    const resetToken = this.verificationTokenService.generateToken();
    const resetTokenExpires = this.verificationTokenService.getExpiryDate();

    // Create new password reset token
    const token = this.tokenRepository.create({
      token: resetToken,
      type: TokenType.PASSWORD_RESET,
      expiresAt: resetTokenExpires,
      user,
    });
    await this.tokenRepository.save(token);

    await this.mailerService.sendPasswordResetEmail(email, resetToken);

    return { message: 'Password reset email sent successfully' };
  }

  async resetPassword(token: string, newPassword: string) {
    const tokenEntity = await this.tokenRepository.findOne({
      where: {
        token,
        type: TokenType.PASSWORD_RESET,
        expiresAt: MoreThan(new Date()),
      },
      relations: ['user'],
    });

    if (!tokenEntity) {
      throw new BadRequestException('Invalid or expired password reset token');
    }

    const user = tokenEntity.user;
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    user.password = newPasswordHash;
    await this.userRepository.save(user);

    await this.tokenRepository.remove(tokenEntity);

    return { message: 'Password reset successfully' };
  }
} 