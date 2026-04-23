import type { Metadata } from "next";

import { ProfileSettingsPage } from "@/components/profile/profile-settings-page";

export const metadata: Metadata = {
  title: "Profile Settings",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ProfileSettingsRoutePage() {
  return <ProfileSettingsPage />;
}
