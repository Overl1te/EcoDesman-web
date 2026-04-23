import type { Metadata } from "next";

import { HelpCenterPage } from "@/components/help/help-center-page";

export const metadata: Metadata = {
  title: "Help Center",
  description:
    "Support documents, FAQ, and guidance for EcoDesman users and contributors.",
};

export default function HelpPage() {
  return <HelpCenterPage />;
}
