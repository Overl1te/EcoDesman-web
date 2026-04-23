import type { Metadata } from "next";

import { PostDetailPage } from "@/components/post/post-detail-page";
import { getServerPost } from "@/lib/server-api";
import { buildPageMetadata } from "@/lib/seo";

type PostDetailRouteProps = {
  params: Promise<{ id: string }>;
};

function getPostKindLabel(kind?: "news" | "event" | "story") {
  if (kind === "event") {
    return "Экологическое событие";
  }

  if (kind === "story") {
    return "История сообщества";
  }

  return "Публикация сообщества";
}

function joinMetaSegments(values: Array<string | undefined>): string {
  return values
    .filter(Boolean)
    .map((value) => value!.trim().replace(/[. ]+$/g, ""))
    .join(". ");
}

function buildExcerpt(value: string, limit = 190): string {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= limit) {
    return normalized;
  }

  return `${normalized.slice(0, limit - 1).trimEnd()}…`;
}

export async function generateMetadata({
  params,
}: PostDetailRouteProps): Promise<Metadata> {
  const { id } = await params;
  const path = `/posts/${id}`;
  const post = await getServerPost(Number(id));

  if (!post) {
    return buildPageMetadata({
      title: "Публикация сообщества ЭкоВыхухоль",
      description:
        "Публичная публикация сообщества ЭкоВыхухоль: детали материала, обсуждение, комментарии и связанные экологические инициативы.",
      path,
    });
  }

  const title =
    post.title?.trim() || `${getPostKindLabel(post.kind)} ЭкоВыхухоль`;
  const description =
    buildExcerpt(
      joinMetaSegments([
        getPostKindLabel(post.kind),
        post.event_location || undefined,
        post.event_date || undefined,
        post.body || undefined,
      ]),
    ) ||
    "Публичная публикация сообщества ЭкоВыхухоль с деталями, материалами и обсуждением.";

  return buildPageMetadata({
    title,
    description,
    path,
  });
}

export default async function PostDetailRoutePage({
  params,
}: PostDetailRouteProps) {
  const resolvedParams = await params;
  return <PostDetailPage postId={Number(resolvedParams.id)} />;
}
