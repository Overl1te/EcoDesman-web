import { Suspense } from "react";

import { SupportCenterPage } from "@/components/support/support-center-page";
import { LoadingBlock } from "@/components/ui/loading-block";

export default function SupportPage() {
  return (
    <Suspense fallback={<LoadingBlock />}>
      <SupportCenterPage />
    </Suspense>
  );
}
