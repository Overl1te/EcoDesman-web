import { ProfilePage } from "@/components/profile/profile-page";

export default async function PublicProfileRoutePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  return <ProfilePage userId={Number(resolvedParams.id)} />;
}
