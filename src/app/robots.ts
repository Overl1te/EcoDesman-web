import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/config";

const PUBLIC_ROUTES = [
  "/",
  "/map",
  "/events",
  "/download",
  "/help",
  "/posts/",
  "/profiles/",
] as const;

const PRIVATE_ROUTES = [
  "/admin",
  "/auth",
  "/favorites",
  "/notifications",
  "/profile$",
  "/settings",
  "/support",
  "/posts/new",
  "/posts/*/edit",
] as const;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [...PUBLIC_ROUTES],
        disallow: [...PRIVATE_ROUTES],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
