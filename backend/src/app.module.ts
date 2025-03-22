import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerService } from './common/services/logger.service';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JobPostModule } from './job-post/job-post.module';
import { DatabaseModule } from './common/database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ImagesModule } from './images/images.module';
import { ApplyingModule } from './applying/applying.module';
import { SearchModule } from './search/search.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      cache: true,
    }),
    DatabaseModule,
    AuthModule,
    JobPostModule,
    UsersModule,
    ImagesModule,
    ApplyingModule,
    SearchModule,
  ],
  controllers: [AppController],
  providers: [AppService, LoggerService],
})
export class AppModule {}
