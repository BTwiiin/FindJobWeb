import { Module, forwardRef } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JobPostModule } from '../job-post/job-post.module';

@Module({
  imports: [
    ElasticsearchModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        node: configService.get('ELASTICSEARCH_URL') || 'http://localhost:9200',
        maxRetries: 10,
        requestTimeout: 60000,
        pingTimeout: 60000,
        auth: {
          username: configService.get('ELASTICSEARCH_USERNAME') || 'elastic',
          password: configService.get('ELASTICSEARCH_PASSWORD') || 'changeme'
        },
        tls: {
          rejectUnauthorized: false
        }
      }),
      inject: [ConfigService],
    }),
    forwardRef(() => JobPostModule),
  ],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {} 