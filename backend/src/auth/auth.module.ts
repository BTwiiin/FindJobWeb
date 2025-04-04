import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { User } from '../entities/user.entity';
import { Token } from '../entities/token.entity';
import { MailerModule } from '../mailer/mailer.module';
import { VerificationTokenService } from './verification-token.service';

@Module({ 
  imports: [
    MailerModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User, Token])
  ],
  providers: [AuthService, JwtStrategy, VerificationTokenService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {} 