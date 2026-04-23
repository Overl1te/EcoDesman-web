import type { Metadata } from "next";

import { PostDetailPage } from "@/components/post/post-detail-page";
import { buildPageMetadata } from "@/lib/seo";

type PostDetailRouteProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: PostDetailRouteProps): Promise<Metadata> {
  const { id } = await params;

  return buildPageMetadata({
    title: "Публикация сообщества",
    description:
      "Публикация в экологическом сообществе ЭкоВыхухоль: детали, материалы, комментарии и обсуждение.",
    path: `/posts/${id}`,
  });
}

export default async function PostDetailRoutePage({ params }: PostDetailRouteProps) {
  const resolvedParams = await params;
  return <PostDetailPage postId={Number(resolvedParams.id)} />;
}
