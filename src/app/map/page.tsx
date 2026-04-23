import type { Metadata } from "next";

import { MapPage } from "@/components/map/map-page";
import { RouteSummary } from "@/components/seo/route-summary";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Карта экоточек",
  description:
    "Интерактивная карта ЭкоВыхухоль показывает пункты переработки, экоточки и пользовательские отметки с фото, видео и комментариями.",
  path: "/map",
});

export default function MapRoutePage() {
  return (
    <MapPage
      intro={
        <RouteSummary
          eyebrow="Интерактивная карта экоточек"
          title="Пункты переработки, полезные места и пользовательские метки"
          description="Карта ЭкоВыхухоль помогает находить пункты приёма вторсырья, экологические объекты и пользовательские метки в Нижнем Новгороде, а также смотреть отзывы, фото и актуальные комментарии."
          highlights={[
            "Карта пунктов переработки, экоточек и городских экологических объектов",
            "Пользовательские метки с фотографиями, видео и локальными подсказками",
            "Фильтры по категориям для быстрого поиска нужного места",
          ]}
          links={[
            { href: "/", label: "Вернуться в ленту" },
            { href: "/events", label: "Ближайшие события" },
            { href: "/help", label: "Справка по карте" },
          ]}
        />
      }
    />
  );
}
