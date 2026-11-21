import "./core/config/load-env.js";

import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";

export async function createApp() {
  const ALLOWED_ORIGINS = [
    process.env.WEB_ORIGIN ?? "http://localhost:3000",
    "http://localhost:3000",
    "http://localhost:8081",
    "http://localhost:19006",
  ];

  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });

  app.setGlobalPrefix("api");
  app.enableCors({ credentials: true, origin: ALLOWED_ORIGINS });
  app.enableShutdownHooks();

  await app.init();

  const server = app.getHttpAdapter().getInstance();
  return { app, server };
}
