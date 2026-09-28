import type { Metadata, Viewport } from "next";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  description:
    "Wearly — rent designer clothing from people near you. A clothing rental marketplace.",
  title: {
    default: "Wearly",
    template: "%s · Wearly",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { color: "#FFFBFC", media: "(prefers-color-scheme: light)" },
    { color: "#171316", media: "(prefers-color-scheme: dark)" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: next-themes sets the `dark` class before paint.
    <html className="h-full" lang="en" suppressHydrationWarning>
      <head>
        {/* Satoshi is self-hosted, so the preload hints next/font would normally
            add are declared by hand. Regular and Medium cover almost all of the
            interface; the rest load on demand. */}
        <link
          as="font"
          crossOrigin="anonymous"
          href="/fonts/satoshi-Regular.woff2"
          rel="preload"
          type="font/woff2"
        />
        <link
          as="font"
          crossOrigin="anonymous"
          href="/fonts/satoshi-Medium.woff2"
          rel="preload"
          type="font/woff2"
        />
      </head>
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
