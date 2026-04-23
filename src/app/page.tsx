import type { Metadata } from "next";
import { connection } from "next/server";

import { MainFeedPage } from "@/components/feed/main-feed-page";
import { RouteSummary } from "@/components/seo/route-summary";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "ЭкоВыхухоль — экологическая лента",
  description:
    "Лента ЭкоВыхухоль помогает следить за экологическими публикациями, инициативами и событиями сообщества в одном месте.",
  path: "/",
});

export default async function HomePage() {
  await connection();

  return (
    <MainFeedPage
      intro={
        <RouteSummary
          eyebrow="Экосообщество Нижнего Новгорода"
          title="Новости, экоточки и события в одном месте"
          description="ЭкоВыхухоль объединяет городские экологические публикации, локальные инициативы, полезные места и календарь встреч, чтобы сообществу было проще находить идеи, точки переработки и актуальные экоактивности."
          highlights={[
            "Лента публикаций, инициатив и городских экологических новостей",
            "Интерактивная карта пунктов переработки, экоточек и пользовательских меток",
            "Календарь экологических мероприятий, встреч и акций сообщества",
          ]}
          links={[
            { href: "/map", label: "Открыть карту" },
            { href: "/events", label: "Посмотреть события" },
            { href: "/help", label: "Справка по платформе" },
          ]}
        />
      }
    />
  );
}
