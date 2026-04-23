import type { Metadata } from "next";

import { ProfilePage } from "@/components/profile/profile-page";

export const metadata: Metadata = {
  title: "My Profile",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ProfileRoutePage() {
  return <ProfilePage />;
}
