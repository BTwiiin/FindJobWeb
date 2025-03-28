import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ValidationPipe } from '@nestjs/common';
import 'reflect-metadata';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { LoggerService } from './common/services/logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  app.enableCors({
    origin: ['http://localhost:3000', 'http://192.168.0.15:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
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
  const logger = app.get(LoggerService);
  app.useLogger(logger);

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  
  logger.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
