import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerService } from './common/services/logger.service';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JobPostModule } from './job-post/job-post.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ImagesModule } from './images/images.module';
import { ApplyingModule } from './applying/applying.module';
import { SearchModule } from './search/search.module';
import { CalendarModule } from './calendar/calendar.module';
import { JobPost } from './entities/job-post.entity';
import { User } from './entities/user.entity';
import { Review } from './entities/review.entity';
import { SavedPost } from './entities/saved-post.entity';
import { Location } from './entities/location.entity';
import { JobApplication } from './entities/job-application.entity';
import { CalendarEvent } from './calendar/calendar.entity';
import { ReviewsModule } from './reviews/reviews.module';
import { CacheModule } from '@nestjs/cache-manager';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CustomCacheInterceptor } from './common/decorators/cache.decorator';
import { cacheConfig } from './config/cache.config';
import { MailerModule } from './mailer/mailer.module';
import { Token } from './entities/token.entity';
import { ChatModule } from './chat/chat.module';
import { ChatRoom } from './entities/chat-room.entity';
import { ChatMessage } from './entities/chat-message.entity';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      cache: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: parseInt(configService.get('DB_PORT') || '5432', 10),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [
          JobPost,
          User,
          Review,
          SavedPost,
          Location,
          JobApplication,
          CalendarEvent,
          Token,
          ChatRoom,
          ChatMessage,
        ],
        synchronize: true,
      }),
    }),
    AuthModule,
    JobPostModule,
    UsersModule,
    ImagesModule,
    ApplyingModule,
    SearchModule,
    CalendarModule,
    ReviewsModule,
    // CacheModule.register(cacheConfig),
    MailerModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    LoggerService,
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: CustomCacheInterceptor,
    // }
  ],
})
export class AppModule {}
