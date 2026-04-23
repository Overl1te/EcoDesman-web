import type { Metadata } from "next";

import { MapPage } from "@/components/map/map-page";

export const metadata: Metadata = {
  title: "Eco Map",
  description:
    "Interactive map of eco points and community markers with photos, videos, and comments.",
};

export default function MapRoutePage() {
  return <MapPage />;
}
