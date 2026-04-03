import { FeedPageContent } from "@/components/feed/feed-page-content";

export function EventsFeedPage() {
  return (
    <FeedPageContent
      title="Мероприятия"
      loadingLabel="Загружаю мероприятия..."
      emptyStateTitle="Событий пока нет"
      emptyStateDescription="Попробуйте сменить период или зайдите позже."
      eventsOnly
      kind="event"
    />
  );
}
