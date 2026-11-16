import type { NextConfig } from "next";

// Trim and drop trailing slashes: `https://api/` + `/api/:path*` would become
// `https://api//api/:path*`, which the edge can resolve as a 404.
const apiProxyUrl = process.env.API_PROXY_URL?.trim().replace(/\/+$/, "");

const nextConfig: NextConfig = {
  async rewrites() {
    // Proxy /api/* to the NestJS backend so the Better Auth session cookie
    // is set on the web origin even when the API lives on another host.
    // See docs/DEPLOYMENT.md. Unset in local dev (API is same-origin-ish
    // via NEXT_PUBLIC_API_URL=http://localhost:4000).
    if (!apiProxyUrl) {
      return [];
    }
    return [
      { destination: `${apiProxyUrl}/api/:path*`, source: "/api/:path*" },
    ];
  },
  // `@wearly/ui` ships raw TypeScript, so Next must compile it.
  // `@wearly/shared` is consumed via its package exports (built `dist/`),
  // matching the API — turbo's `^build` guarantees it exists first.
  transpilePackages: ["@wearly/ui"],
  typedRoutes: true,
};

export default nextConfig;
