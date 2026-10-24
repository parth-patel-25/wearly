import type { NextConfig } from "next";

const apiProxyUrl = process.env.API_PROXY_URL;

const nextConfig: NextConfig = {
  // `@wearly/ui` ships raw TypeScript, so Next must compile it.
  // `@wearly/shared` is consumed via its package exports (built `dist/`),
  // matching the API — turbo's `^build` guarantees it exists first.
  transpilePackages: ["@wearly/ui"],
  typedRoutes: true,
  async rewrites() {
    // Proxy /api/* to the NestJS backend so the Better Auth session cookie
    // is set on the web origin even when the API lives on another host.
    // See docs/DEPLOYMENT.md. Unset in local dev (API is same-origin-ish
    // via NEXT_PUBLIC_API_URL=http://localhost:4000).
    if (!apiProxyUrl) return [];
    return [{ source: "/api/:path*", destination: `${apiProxyUrl}/api/:path*` }];
  },
};

export default nextConfig;
