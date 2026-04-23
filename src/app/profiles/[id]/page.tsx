import { notFound, permanentRedirect } from "next/navigation";

import { ProfilePage } from "@/components/profile/profile-page";
import { buildProfilePath } from "@/lib/paths";
import { getServerPublicProfile } from "@/lib/server-api";

type LegacyPublicProfileRouteProps = {
  params: Promise<{ id: string }>;
};

export default async function LegacyPublicProfileRoutePage({
  params,
}: LegacyPublicProfileRouteProps) {
  const { id } = await params;
  const profile = await getServerPublicProfile(Number(id));

  if (!profile) {
    notFound();
  }

  const canonicalPath = buildProfilePath(profile);
  if (canonicalPath === `/profiles/${id}`) {
    return <ProfilePage userId={profile.id} />;
  }

  permanentRedirect(canonicalPath);
}
