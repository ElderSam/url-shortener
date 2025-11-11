import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { readFileSync } from 'fs';
import { join } from 'path';
import { OpenAPIObject } from '@nestjs/swagger';
const swaggerDocument: OpenAPIObject = JSON.parse(readFileSync(join(__dirname, '../swagger.json'), 'utf8'));

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Register global middleware for optional authentication
  // Static import of the middleware
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { OptionalAuthMiddleware } = require('./common/middleware/optional-auth.middleware');
  app.use(new OptionalAuthMiddleware().use);

  // Enable global validation for DTOs
  app.useGlobalPipes(new ValidationPipe({
    transform: true, // enables transformation
    whitelist: true, // optional: removes fields not defined in the DTO
  }));

  // Global response interceptor
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  SwaggerModule.setup('api', app, swaggerDocument);

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
