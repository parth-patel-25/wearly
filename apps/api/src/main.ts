import { Logger } from "@nestjs/common";
import { createApp } from "./create-app.js";

const PORT = Number(process.env.PORT ?? 4000);
const API_PREFIX = "api";
/** Non-zero exit code when the API fails to boot. */
const EXIT_FAILURE = 1;

async function bootstrap() {
  const { app } = await createApp();

  await app.listen(PORT);

  Logger.log(
    `API ready on http://localhost:${PORT}/${API_PREFIX}`,
    "Bootstrap"
  );
}

bootstrap().catch((error: unknown) => {
  Logger.error(
    "Failed to boot the API",
    error instanceof Error ? (error.stack ?? error.message) : String(error),
    "Bootstrap"
  );
  process.exit(EXIT_FAILURE);
});
