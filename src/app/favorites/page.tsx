import { Suspense } from "react";

import { FavoritesFeedPage } from "@/components/feed/favorites-feed-page";
import { LoadingBlock } from "@/components/ui/loading-block";

export default function FavoritesPageRoute() {
  return (
    <Suspense fallback={<LoadingBlock label="Загружаю избранное..." />}>
      <FavoritesFeedPage />
    </Suspense>
  );
}
