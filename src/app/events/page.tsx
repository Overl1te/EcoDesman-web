import type { Metadata } from "next";
import { Suspense } from "react";

import { EventsFeedPage } from "@/components/feed/events-feed-page";
import { LoadingBlock } from "@/components/ui/loading-block";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Экологические события",
  description:
    "Экологические мероприятия, встречи и акции сообщества ЭкоВыхухоль: выбирайте события, участвуйте и следите за обновлениями.",
  path: "/events",
});

export default function EventsPage() {
  return (
    <Suspense fallback={<LoadingBlock label="Загружаю календарь мероприятий..." />}>
      <EventsFeedPage />
    </Suspense>
  );
}
