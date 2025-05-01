import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ValidationPipe } from '@nestjs/common';
import 'reflect-metadata';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { LoggerService } from './common/services/logger.service';
import { Logger } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ConfigService } from '@nestjs/config';
import { ServerOptions } from 'socket.io';

// Create a custom IoAdapter that properly configures Socket.io
class CustomIoAdapter extends IoAdapter {
  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, {
      ...options,
      cors: {
        origin: true, // Allow all origins in development
        methods: ['GET', 'POST'],
        credentials: true,
        allowedHeaders: ['Authorization', 'Content-Type'],
      },
      allowEIO3: true,
      transports: ['websocket', 'polling'],
      path: '/socket.io/',
    });
    return server;
  }
}

async function bootstrap() {
  const logger = new Logger('Main');
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  // Enable Socket.IO adapter for WebSockets with proper configuration
  app.useWebSocketAdapter(new CustomIoAdapter(app));

  // Enable CORS
  app.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type'],
  });
  
  // Apply global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());
  
  // Enable global validation with detailed error messages
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true, // Strip properties that don't have decorators
    forbidNonWhitelisted: true, // Throw errors if non-whitelisted properties are present
    exceptionFactory: (errors) => {
      const messages = errors.map(error => {
        const constraints = Object.values(error.constraints || {});
        return {
          field: error.property,
          messages: constraints
        };
      });
      return {
        statusCode: 400,
        message: 'Validation failed',
        errors: messages,
        error: 'ValidationException',
        timestamp: new Date().toISOString()
      };
    }
  }));

  // Apply logger middleware
  app.use(LoggerMiddleware);

  // Use custom logger
  const loggerService = app.get(LoggerService);
  app.useLogger(loggerService);

  const port = configService.get('PORT') || 3001;
  await app.listen(port);
  
  logger.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
