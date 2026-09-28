import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";

const PORT = Number(process.env.PORT ?? 4000);
const API_PREFIX = "api";

// The web app and Expo apps run on different origins in development.
const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:8081",
  "http://localhost:19006",
];

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix(API_PREFIX);
  app.enableCors({ origin: ALLOWED_ORIGINS });
  // No global ValidationPipe: request bodies and queries are validated with
  // ZodValidationPipe using the schemas in @wearly/shared.
  app.enableShutdownHooks();

  await app.listen(PORT);

  Logger.log(
    `API ready on http://localhost:${PORT}/${API_PREFIX}`,
    "Bootstrap"
  );
}

bootstrap().catch((error: unknown) => {
  Logger.error(
    "Failed to start the API",
    error instanceof Error ? (error.stack ?? error.message) : String(error),
    "Bootstrap"
  );
  process.exit(1);
});
