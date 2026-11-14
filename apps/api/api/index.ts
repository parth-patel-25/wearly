import { createApp } from "../src/create-app.js";

// Vercel invokes this handler per request. Bootstrap once and reuse the
// Express instance across warm invocations.
let initPromise: Promise<{ server: (req: any, res: any) => void }> | null = null;

function bootstrap() {
  if (!initPromise) {
    initPromise = createApp().then(({ server }) => ({ server }));
  }
  return initPromise;
}

export default async function handler(req: any, res: any) {
  const { server } = await bootstrap();
  return server(req, res);
}