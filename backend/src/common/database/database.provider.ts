import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { JobPost } from '../../entities/job-post.entity';
import { User } from '../../entities/user.entity';
import { Review } from '../../entities/review.entity';
import { SavedPost } from '../../entities/saved-post.entity';
import { Location } from '../../entities/location.entity';
import { JobApplication } from '../../entities/job-application.entity';
import { CalendarEvent } from 'src/calendar/calendar.entity';

export const databaseProvider = [
    {
      provide: 'DATA_SOURCE',
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        try {
          const host = configService.get('DB_HOST');
          const port = configService.get('DB_PORT');
          const username = configService.get('DB_USERNAME');
          const password = configService.get('DB_PASSWORD');
          const database = configService.get('DB_NAME');

          if (!host || !port || !username || !password || !database) {
            throw new Error('Database configuration is incomplete. Please check your .env file.');
          }

          console.log('Connecting to database...', {
            host,
            port,
            username,
            database,
          });

          const dataSource = new DataSource({
            type: 'postgres',
            host,
            port: parseInt(port, 10),
            username,
            password,
            database,
            entities: [
                JobPost,
                User,
                Review,
                SavedPost,
                Location,
                JobApplication,
                CalendarEvent,
            ],
            synchronize: true,
            logging: true,
          });
    
          const connection = await dataSource.initialize();
          console.log('Database connection established successfully');
          return connection;
        } catch (error) {
          console.error('Error connecting to database:', error);
          throw error;
        }
      },
    },
  ];

