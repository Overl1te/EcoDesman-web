import type { Metadata } from "next";

import { EventsFeedPage } from "@/components/feed/events-feed-page";
import { RouteSummary } from "@/components/seo/route-summary";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Экологические события",
  description:
    "Экологические мероприятия, встречи и акции сообщества ЭкоВыхухоль: выбирайте события, участвуйте и следите за обновлениями.",
  path: "/events",
});

export default function EventsPage() {
  return (
    <EventsFeedPage
      intro={
        <RouteSummary
          eyebrow="Календарь экологических встреч"
          title="Городские экомероприятия, акции и встречи сообщества"
          description="Раздел событий помогает быстро найти ближайшие экологические встречи, волонтёрские акции, лекции, сборы вторсырья и другие активности ЭкоВыхухоль и локального сообщества."
          highlights={[
            "Календарь ближайших экологических событий и городских акций",
            "Подборка встреч, лекций, волонтёрских и просветительских инициатив",
            "Быстрый переход к карточке события с подробностями и временем проведения",
          ]}
          links={[
            { href: "/", label: "Открыть ленту" },
            { href: "/map", label: "Карта экоточек" },
            { href: "/help", label: "Как пользоваться сервисом" },
          ]}
        />
      }
    />
  );
}
