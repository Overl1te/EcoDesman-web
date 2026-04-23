import type { Metadata } from "next";
import { Suspense } from "react";

import { SupportCenterPage } from "@/components/support/support-center-page";
import { LoadingBlock } from "@/components/ui/loading-block";

export const metadata: Metadata = {
  title: "Support",
  description:
    "Support center and moderation tools for reports, threads, and user questions.",
};

export default function SupportPage() {
  return (
    <Suspense fallback={<LoadingBlock />}>
      <SupportCenterPage />
    </Suspense>
  );
}
