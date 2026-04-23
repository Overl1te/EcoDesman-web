import type { Metadata } from "next";
import { Suspense } from "react";

import { EventsFeedPage } from "@/components/feed/events-feed-page";
import { LoadingBlock } from "@/components/ui/loading-block";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Upcoming environmental events, meetups, and community activities.",
};

export default function EventsPage() {
  return (
    <Suspense fallback={<LoadingBlock label="Загружаю календарь мероприятий..." />}>
      <EventsFeedPage />
    </Suspense>
  );
}
