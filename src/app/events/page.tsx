import type { Metadata } from "next";
import { connection } from "next/server";

import { EventsFeedPage } from "@/components/feed/events-feed-page";
import {
  RouteFaq,
  RouteLinkGrid,
  RouteTopicGrid,
} from "@/components/seo/route-content";
import { RouteSummary } from "@/components/seo/route-summary";
import { StructuredDataScript } from "@/components/seo/structured-data-script";
import { listServerUpcomingEvents } from "@/lib/server-api";
import {
  absoluteUrl,
  buildCollectionPageStructuredData,
  buildFaqStructuredData,
  buildPageMetadata,
  type SeoFaqItem,
} from "@/lib/seo";
import type { PostListItem } from "@/lib/types";

const EVENT_FAQ: SeoFaqItem[] = [
  {
    question: "Какие события есть в разделе мероприятий?",
    answer:
      "В календаре ЭкоВыхухоли можно найти экологические акции, лекции, встречи сообщества, волонтерские выезды, городские сборы вторсырья и другие публичные активности.",
  },
  {
    question: "Как понять, что мероприятие актуально?",
    answer:
      "В карточках событий показываются дата, время, место проведения и статус мероприятия. Если событие отменено, это тоже видно прямо в календаре и в карточке поста.",
  },
  {
    question: "Где посмотреть связанные точки и места?",
    answer:
      "После выбора события можно перейти к публикации и затем открыть карту экоточек, чтобы сопоставить мероприятие с полезными местами, пунктами переработки и соседними локациями.",
  },
];

export const metadata: Metadata = buildPageMetadata({
  title: "Экологические мероприятия и акции в Нижнем Новгороде",
  description:
    "Календарь ЭкоВыхухоли помогает следить за экологическими мероприятиями, городскими акциями, лекциями и встречами сообщества в Нижнем Новгороде. Выбирайте события, изучайте детали и не пропускайте обновления.",
  path: "/events",
});

function buildEventDescription(event: PostListItem): string {
  const parts = [
    event.event_location?.trim(),
    event.preview_text?.trim(),
    event.body?.trim(),
  ].filter(Boolean);

  const description = parts.join(". ").replace(/\s+/g, " ").trim();
  if (description.length <= 220) {
    return description;
  }

  return `${description.slice(0, 219).trimEnd()}…`;
}

function toAbsoluteMediaUrl(url: string): string {
  try {
    return new URL(url).toString();
  } catch {
    return absoluteUrl(url.startsWith("/") ? url : `/${url}`);
  }
}

function buildEventStructuredData(event: PostListItem) {
  const url = absoluteUrl(`/posts/${event.id}`);

  return {
    "@type": "Event",
    "@id": `${url}#event`,
    url,
    name: event.title?.trim() || "Экологическое событие",
    description: buildEventDescription(event),
    startDate: event.event_starts_at ?? event.event_date ?? undefined,
    endDate: event.event_ends_at ?? undefined,
    eventStatus: event.is_event_cancelled
      ? "https://schema.org/EventCancelled"
      : "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    isAccessibleForFree: true,
    inLanguage: "ru-RU",
    location: event.event_location
      ? {
          "@type": "Place",
          name: event.event_location,
        }
      : undefined,
    image: event.preview_image_url
      ? [toAbsoluteMediaUrl(event.preview_image_url)]
      : undefined,
  };
}

export default async function EventsPage() {
  await connection();

  const upcomingEvents = await listServerUpcomingEvents();
  const eventListStructuredData = upcomingEvents.length
    ? {
        "@type": "ItemList",
        "@id": `${absoluteUrl("/events")}#upcoming-events`,
        url: absoluteUrl("/events"),
        name: "Ближайшие экологические события ЭкоВыхухоли",
        numberOfItems: upcomingEvents.length,
        itemListOrder: "https://schema.org/ItemListOrderAscending",
        itemListElement: upcomingEvents.map((event, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: absoluteUrl(`/posts/${event.id}`),
          name: event.title?.trim() || "Экологическое событие",
        })),
      }
    : null;

  return (
    <>
      <StructuredDataScript
        data={[
          buildCollectionPageStructuredData({
            path: "/events",
            name: "Экологические мероприятия и акции в Нижнем Новгороде",
            description:
              "Календарь экологических событий, городских акций, лекций и встреч сообщества ЭкоВыхухоль.",
            about: [
              "экологические мероприятия",
              "городские акции",
              "экосообщество",
              "эколекции",
              "сбор вторсырья",
            ],
          }),
          buildFaqStructuredData("/events", EVENT_FAQ),
          ...(eventListStructuredData ? [eventListStructuredData] : []),
          ...upcomingEvents.map(buildEventStructuredData),
        ]}
      />
      <EventsFeedPage
        intro={
          <RouteSummary
            eyebrow="Календарь экологических событий"
            title="Экологические мероприятия, акции и встречи сообщества"
            headingLevel={1}
            description="Раздел мероприятий помогает быстро находить ближайшие экологические встречи, лекции, городские акции, субботники и другие активности ЭкоВыхухоли и локального сообщества."
            paragraphs={[
              "Эта страница полезна не только как календарь. Она показывает, когда и где проходят экологические события в Нижнем Новгороде, помогает сравнивать даты, проверять статус мероприятия и переходить к публикациям с деталями участия.",
            ]}
            highlights={[
              "Календарь ближайших экологических встреч и городских акций",
              "Карточки событий с датой, временем, местом и статусом",
              "Быстрый переход к постам, участникам и связанным разделам сервиса",
            ]}
            links={[
              {
                href: "/map",
                label: "Карта экоточек и экомест",
                description: "Открыть карту пунктов переработки и полезных мест рядом с событиями.",
              },
              {
                href: "/",
                label: "Главная страница сообщества",
                description: "Вернуться к публикациям, инициативам и городским экологическим новостям.",
              },
              {
                href: "/download",
                label: "Мобильное приложение",
                description: "Установить приложение, чтобы следить за событиями с телефона.",
              },
            ]}
          />
        }
        afterContent={
          <>
            <RouteTopicGrid
              eyebrow="Как устроен раздел событий"
              topics={[
                {
                  title: "Какие форматы мероприятий бывают",
                  description:
                    "В календаре собираются открытые встречи сообщества, лекции, городские акции, экологические сборы, волонтерские активности и другие события, связанные с экопрактиками и инициативами города.",
                },
                {
                  title: "Как следить за обновлениями",
                  description:
                    "Можно смотреть календарь по дням, открывать подробные карточки и переходить к публикациям авторов, чтобы не пропустить изменения по дате, месту, времени и статусу мероприятия.",
                },
                {
                  title: "Зачем связывать календарь с картой",
                  description:
                    "Связка событий с картой экоточек помогает лучше планировать участие: понимать, какие пункты переработки, экоместа и полезные локации находятся рядом с местом проведения.",
                },
              ]}
            />
            <RouteFaq items={EVENT_FAQ} />
            <RouteLinkGrid
              eyebrow="Связанные разделы"
              links={[
                {
                  href: "/map",
                  label: "Карта пунктов переработки и экоточек",
                  description: "Посмотреть полезные места, которые можно совместить с посещением события.",
                },
                {
                  href: "/download",
                  label: "Приложение ЭкоВыхухоль",
                  description: "Установить мобильную версию для быстрого доступа к календарю и уведомлениям.",
                },
                {
                  href: "/help",
                  label: "Справка по сервису",
                  description: "Прочитать инструкции, документы и ответы на частые вопросы.",
                },
              ]}
            />
          </>
        }
      />
    </>
  );
}
