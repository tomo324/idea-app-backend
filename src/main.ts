import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const devOrigins = ['http://localhost:3000'];
  const prodOrigins = ['https://aidea-park.vercel.app'];

  const origins =
    process.env.NODE_ENV === 'production' ? prodOrigins : devOrigins;
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  app.enableCors({
    origin: origins,
    credentials: true,
  });
  await app.listen(3333);
}
bootstrap();
