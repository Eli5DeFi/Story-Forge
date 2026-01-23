import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // Global prefix
  app.setGlobalPrefix('api');

  // CORS
  app.enableCors({
    origin: configService.get('CORS_ORIGINS')?.split(',') || [
      'http://localhost:3000',
    ],
    credentials: true,
  });

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Story-Forge API')
    .setDescription(
      'API for the Story-Forge interactive AI web novel platform',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('stories', 'Story and chapter management')
    .addTag('betting', 'Prediction market operations')
    .addTag('compendium', 'Lore and entity management')
    .addTag('nfts', 'NFT minting and gallery')
    .addTag('users', 'User profiles and statistics')
    .addTag('auth', 'Authentication with wallet signatures')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  const port = configService.get('PORT') || 3001;
  await app.listen(port);

  console.log(`Story-Forge API running on port ${port}`);
  console.log(`Swagger documentation available at /docs`);
}

bootstrap();
