import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Workspace packages ship raw TypeScript, so Next must compile them.
  transpilePackages: ["@wearly/ui", "@wearly/shared"],
  typedRoutes: true,
};

export default nextConfig;
