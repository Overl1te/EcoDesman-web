import type { Metadata } from "next";
import { Suspense } from "react";

import { MainFeedPage } from "@/components/feed/main-feed-page";
import { LoadingBlock } from "@/components/ui/loading-block";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "ЭкоВыхухоль — экологическая лента",
  description:
    "Лента ЭкоВыхухоль помогает следить за экологическими публикациями, инициативами и событиями сообщества в одном месте.",
  path: "/",
});

export default function HomePage() {
  return (
    <Suspense fallback={<LoadingBlock label="Загружаю ленту..." />}>
      <MainFeedPage />
    </Suspense>
  );
}
