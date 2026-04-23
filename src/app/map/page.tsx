import type { Metadata } from "next";

import { MapPage } from "@/components/map/map-page";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Карта экоточек",
  description:
    "Интерактивная карта ЭкоВыхухоль показывает пункты переработки, экоточки и пользовательские отметки с фото, видео и комментариями.",
  path: "/map",
});

export default function MapRoutePage() {
  return <MapPage />;
}
