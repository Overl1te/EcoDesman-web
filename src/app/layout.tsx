import type { Metadata } from "next";
import localFont from "next/font/local";

import { AppProviders } from "@/components/providers/app-providers";
import { APP_NAME } from "@/lib/config";
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
  title: APP_NAME,
  description: "Веб-версия ЭкоВыхухоли на Next.js",
  icons: {
    icon: "/icon.png",
  },
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
