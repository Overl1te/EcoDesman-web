import { Suspense } from "react";

import { MainFeedPage } from "@/components/feed/main-feed-page";
import { LoadingBlock } from "@/components/ui/loading-block";

export default function HomePage() {
  return (
    <Suspense fallback={<LoadingBlock label="Загружаю ленту..." />}>
      <MainFeedPage />
    </Suspense>
  );
}
