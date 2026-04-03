import type { Metadata } from "next";
import { Manrope } from "next/font/google";

import { AppProviders } from "@/components/providers/app-providers";
import { APP_NAME } from "@/lib/config";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
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
