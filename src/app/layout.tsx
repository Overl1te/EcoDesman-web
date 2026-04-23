import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";

import { AppProviders } from "@/components/providers/app-providers";
import { APP_NAME, SITE_URL } from "@/lib/config";
import "./globals.css";

const manrope = localFont({
  src: [
    { path: "./fonts/Manrope-cyrillic-ext.woff2", weight: "200 800", style: "normal" },
    { path: "./fonts/Manrope-cyrillic.woff2", weight: "200 800", style: "normal" },
    { path: "./fonts/Manrope-greek.woff2", weight: "200 800", style: "normal" },
    { path: "./fonts/Manrope-vietnamese.woff2", weight: "200 800", style: "normal" },
    { path: "./fonts/Manrope-latin-ext.woff2", weight: "200 800", style: "normal" },
    { path: "./fonts/Manrope-latin.woff2", weight: "200 800", style: "normal" },
  ],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: APP_NAME,
  title: {
    default: `${APP_NAME} - eco map and community`,
    template: `%s | ${APP_NAME}`,
  },
  description:
    "Eco map with recycling points, user markers, comments, and environmental events.",
  keywords: [
    "eco map",
    "recycling",
    "eco points",
    "environment",
    "user markers",
    "nizhny novgorod",
    "ecodesman",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: "/",
    siteName: APP_NAME,
    title: `${APP_NAME} - eco map and community markers`,
    description:
      "Find eco points, add your own places with media, and explore community activity on the map.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: `${APP_NAME} open graph image`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP_NAME} - eco map and community markers`,
    description:
      "Recycling points, user map markers, photos, videos, and comments in one map app.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-video-preview": -1,
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: [{ url: "/favicon.ico" }],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  category: "environment",
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3f5ef" },
    { media: "(prefers-color-scheme: dark)", color: "#090c10" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={manrope.variable}>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
