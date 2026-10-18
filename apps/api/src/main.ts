import "./core/config/load-env.js";

import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";

const PORT = Number(process.env.PORT ?? 4000);
const API_PREFIX = "api";
/** Non-zero exit code when the API fails to boot. */
const EXIT_FAILURE = 1;

// The web app and Expo apps run on different origins in development.
const ALLOWED_ORIGINS = [
  process.env.WEB_ORIGIN ?? "http://localhost:3000",
  "http://localhost:3000",
  "http://localhost:8081",
  "http://localhost:19006",
];

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // Better Auth needs the raw body on /api/auth/*; the integration re-adds
    // JSON/urlencoded parsing for every other route.
    // See docs/auth-and-database.md §4 Step 4.
    bodyParser: false,
  });

  app.setGlobalPrefix(API_PREFIX);
  // credentials: the admin web app sends the Better Auth session cookie
  // cross-origin (localhost:3000 → :4000).
  app.enableCors({ credentials: true, origin: ALLOWED_ORIGINS });
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
  process.exit(EXIT_FAILURE);
});
