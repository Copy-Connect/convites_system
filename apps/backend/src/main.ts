// apps/backend/src/main.ts
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        cors: {
            origin: ["http://localhost:5173"],
        }
    });

    //TODO: avaliar se a limitação abaixo faz sentido aqui no main
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    )

    const port = parseInt(process.env.PORT ?? '3000', 10); // <<< deixe só esta linha
    await app.listen(port, '0.0.0.0');
}
bootstrap();
