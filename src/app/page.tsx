import type { Metadata } from "next";
import { Suspense } from "react";

import { MainFeedPage } from "@/components/feed/main-feed-page";
import { LoadingBlock } from "@/components/ui/loading-block";

export const metadata: Metadata = {
  title: "Eco Feed",
  description:
    "Main eco community feed with stories, events, and updates from EcoDesman.",
};

export default function HomePage() {
  return (
    <Suspense fallback={<LoadingBlock label="Загружаю ленту..." />}>
      <MainFeedPage />
    </Suspense>
  );
}
