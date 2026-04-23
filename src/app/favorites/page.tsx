import type { Metadata } from "next";
import { Suspense } from "react";

import { FavoritesFeedPage } from "@/components/feed/favorites-feed-page";
import { LoadingBlock } from "@/components/ui/loading-block";

export const metadata: Metadata = {
  title: "Favorites",
  robots: {
    index: false,
    follow: false,
  },
};

export default function FavoritesPageRoute() {
  return (
    <Suspense fallback={<LoadingBlock label="Загружаю избранное..." />}>
      <FavoritesFeedPage />
    </Suspense>
  );
}
