import type { Metadata } from "next";

import { ProfilePage } from "@/components/profile/profile-page";
import { buildPageMetadata } from "@/lib/seo";

type PublicProfileRouteProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: PublicProfileRouteProps): Promise<Metadata> {
  const { id } = await params;

  return buildPageMetadata({
    title: "Профиль участника",
    description:
      "Публичный профиль участника ЭкоВыхухоль с публикациями, активностью и вкладом в экологическое сообщество.",
    path: `/profiles/${id}`,
  });
}

export default async function PublicProfileRoutePage({
  params,
}: PublicProfileRouteProps) {
  const resolvedParams = await params;
  return <ProfilePage userId={Number(resolvedParams.id)} />;
}
