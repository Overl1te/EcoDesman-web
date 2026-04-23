import type { Metadata } from "next";

import { HelpCenterPage } from "@/components/help/help-center-page";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Справка",
  description:
    "Справка ЭкоВыхухоль: документы, ответы на вопросы, правила проекта и ссылки на веб, серверный и мобильный репозитории.",
  path: "/help",
});

export default function HelpPage() {
  return <HelpCenterPage />;
}
