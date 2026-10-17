import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // `@wearly/ui` ships raw TypeScript, so Next must compile it.
  // `@wearly/shared` is consumed via its package exports (built `dist/`),
  // matching the API — turbo's `^build` guarantees it exists first.
  transpilePackages: ["@wearly/ui"],
  typedRoutes: true,
};

export default nextConfig;
