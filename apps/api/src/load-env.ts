import { config } from "dotenv";

/**
 * Loads environment variables before any module that reads `process.env` at
 * import time. Must be the FIRST import in `main.ts` (ESM runs it before
 * `app.module` and its transitive imports evaluate). Order mirrors
 * `ConfigModule.forRoot({ envFilePath: ["../../.env", ".env"] })` — the root
 * file wins.
 */
config({ path: "../../.env" });
config({ path: ".env" });
