import type { Metadata } from "next";

import { HelpCenterPage } from "@/components/help/help-center-page";
import { StructuredDataScript } from "@/components/seo/structured-data-script";
import {
  buildPageMetadata,
  buildWebPageStructuredData,
} from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Справка ЭкоВыхухоль — документы, инструкции и ответы",
  description:
    "Справка ЭкоВыхухоль содержит документы проекта, инструкции по сервису, ответы на частые вопросы и ссылки на репозитории web, server и mobile. Здесь собрана публичная информация по платформе и правилам.",
  path: "/help",
});

export default function HelpPage() {
  return (
    <>
      <StructuredDataScript
        data={[
          buildWebPageStructuredData({
            path: "/help",
            name: "Справка ЭкоВыхухоль",
            description:
              "Публичная справка по сервису: документы, инструкции, ответы на вопросы и ссылки на репозитории проекта.",
            about: [
              "документы проекта",
              "инструкции по сервису",
              "ответы на вопросы",
              "репозитории EcoDesman",
            ],
          }),
        ]}
      />
      <HelpCenterPage />
    </>
  );
}
