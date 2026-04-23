import type { Metadata } from "next";

import { AppDownloadLinks } from "@/components/layout/app-download-links";
import { AppShell } from "@/components/layout/app-shell";
import {
  RouteFaq,
  RouteLinkGrid,
  RouteTopicGrid,
} from "@/components/seo/route-content";
import { RouteSummary } from "@/components/seo/route-summary";
import { StructuredDataScript } from "@/components/seo/structured-data-script";
import { MOBILE_APP_LINKS } from "@/lib/config";
import {
  buildFaqStructuredData,
  buildMobileApplicationStructuredData,
  buildPageMetadata,
  buildWebPageStructuredData,
  type SeoFaqItem,
} from "@/lib/seo";

const DOWNLOAD_FAQ: SeoFaqItem[] = [
  {
    question: "Есть ли мобильное приложение ЭкоВыхухоль?",
    answer:
      "Да. На странице загрузки собраны актуальные ссылки на мобильные сборки и репозиторий приложения, чтобы можно было быстро перейти к нужной платформе.",
  },
  {
    question: "Что удобнее делать в приложении?",
    answer:
      "Мобильная версия удобнее для карты, уведомлений, чтения публикаций, быстрого открытия событий и повседневного использования сервиса с телефона.",
  },
  {
    question: "Кому полезно приложение?",
    answer:
      "Приложение подходит тем, кто регулярно пользуется картой экоточек, следит за экологическими событиями и хочет иметь быстрый доступ к сообществу и обновлениям без привязки к десктопу.",
  },
];

export const metadata: Metadata = buildPageMetadata({
  title: "Скачать приложение ЭкоВыхухоль для Android и iPhone",
  description:
    "Скачайте мобильное приложение ЭкоВыхухоль для Android и iPhone. Приложение дает быстрый доступ к карте экоточек, экологическим событиям, публикациям сообщества и уведомлениям.",
  path: "/download",
});

export default function DownloadPage() {
  return (
    <>
      <StructuredDataScript
        data={[
          buildWebPageStructuredData({
            path: "/download",
            name: "Скачать приложение ЭкоВыхухоль",
            description:
              "Страница загрузки мобильного приложения ЭкоВыхухоль для Android и iPhone.",
            about: [
              "мобильное приложение",
              "карта экоточек",
              "экологические события",
              "уведомления сообщества",
            ],
          }),
          buildMobileApplicationStructuredData({
            path: "/download",
            name: "ЭкоВыхухоль",
            description:
              "Мобильное приложение ЭкоВыхухоль для карты экоточек, экологических событий, публикаций сообщества и уведомлений.",
            downloadUrls: [
              MOBILE_APP_LINKS.android,
              MOBILE_APP_LINKS.ios,
              MOBILE_APP_LINKS.repository,
            ],
          }),
          buildFaqStructuredData("/download", DOWNLOAD_FAQ),
        ]}
      />
      <AppShell title="Приложение" titleTag="p">
        <RouteSummary
          eyebrow="Мобильная версия сервиса"
          title="Мобильное приложение ЭкоВыхухоль для Android и iPhone"
          headingLevel={1}
          description="Страница загрузки нужна не только как точка перехода к сборке. Она объясняет, зачем устанавливать приложение, какие сценарии удобнее выполнять с телефона и как быстро перейти к актуальной версии для своей платформы."
          paragraphs={[
            "Мобильное приложение дает более удобный доступ к карте экоточек, уведомлениям, публикациям сообщества и календарю событий. Для тех, кто регулярно пользуется сервисом в городе, нативная версия быстрее, стабильнее и практичнее обычной мобильной веб-страницы.",
          ]}
          highlights={[
            "Быстрый доступ к карте, экоточкам и городским маршрутам",
            "Удобное чтение публикаций и открытие событий с телефона",
            "Актуальные ссылки на сборки и репозиторий мобильного клиента",
          ]}
          links={[
            {
              href: "/map",
              label: "Карта экоточек и переработки",
              description: "Открыть карту пунктов приема, полезных мест и пользовательских меток.",
            },
            {
              href: "/events",
              label: "Экологические события",
              description: "Посмотреть календарь мероприятий, лекций и городских акций.",
            },
            {
              href: "/help",
              label: "Справка по сервису",
              description: "Прочитать инструкции, документы и ответы на частые вопросы.",
            },
          ]}
        />

        <section className="support-layout">
          <section className="panel info-panel">
            <p className="eyebrow">Мобильный опыт</p>
            <h2 className="info-title">Зачем устанавливать приложение на телефон</h2>
            <p className="info-description">
              Нативная сборка удобнее для повседневной работы с картой, уведомлениями и
              публикациями сообщества. Она быстрее открывается, лучше ведет себя на мобильных
              устройствах и проще интегрируется в привычный сценарий использования сервиса.
            </p>
          </section>

          <section className="panel info-panel">
            <AppDownloadLinks
              title="Доступные платформы"
              description="Выберите нужную платформу и откройте актуальную страницу загрузки мобильного приложения ЭкоВыхухоль."
            />
          </section>
        </section>

        <RouteTopicGrid
          eyebrow="Что дает приложение"
          topics={[
            {
              title: "Для кого подходит мобильная версия",
              description:
                "Приложение полезно активным пользователям сервиса, участникам сообщества, тем, кто регулярно пользуется картой экоточек и хочет быстро открывать события и публикации прямо с телефона.",
            },
            {
              title: "Какие возможности удобнее на телефоне",
              description:
                "На мобильном устройстве быстрее работать с картой, открывать точки рядом, читать публикации в дороге и оперативно переходить к мероприятиям и новым материалам сообщества.",
            },
            {
              title: "Почему важна отдельная страница загрузки",
              description:
                "Страница /download помогает поисковикам и пользователям понимать ценность мобильного приложения, а не только нажимать на CTA-кнопку. Здесь собраны преимущества, платформы и связанные разделы сервиса.",
            },
          ]}
        />

        <RouteFaq items={DOWNLOAD_FAQ} />

        <RouteLinkGrid
          eyebrow="Продолжить в сервисе"
          links={[
            {
              href: "/map",
              label: "Карта экоточек Нижнего Новгорода",
              description: "Перейти к интерактивной карте пунктов переработки и полезных мест.",
            },
            {
              href: "/events",
              label: "Экологические мероприятия и акции",
              description: "Открыть календарь встреч, лекций, сборов вторсырья и других событий.",
            },
            {
              href: "/help",
              label: "Справка, документы и инструкции",
              description: "Посмотреть ответы на вопросы, документы проекта и технические ссылки.",
            },
          ]}
        />
      </AppShell>
    </>
  );
}
