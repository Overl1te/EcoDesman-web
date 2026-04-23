import type { ReactNode } from "react";

import { FeedPageContent } from "@/components/feed/feed-page-content";

export function MainFeedPage({ intro }: { intro?: ReactNode }) {
  return (
    <FeedPageContent
      title="Лента"
      loadingLabel="Загружаю ленту..."
      emptyStateTitle="Публикаций пока нет"
      emptyStateDescription="Попробуйте изменить фильтры или зайдите позже."
      intro={intro}
    />
  );
}
