import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/config";

const STATIC_ROUTES = [
  "/",
  "/map",
  "/events",
  "/help",
  "/download",
  "/favorites",
  "/notifications",
  "/profile",
  "/settings/profile",
  "/support",
  "/auth",
  "/admin",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return STATIC_ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: path === "/" ? "daily" : "weekly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
