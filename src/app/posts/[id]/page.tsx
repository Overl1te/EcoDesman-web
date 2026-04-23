import { notFound, permanentRedirect } from "next/navigation";

import { PostDetailPage } from "@/components/post/post-detail-page";
import { buildPostPath } from "@/lib/paths";
import { getServerPost } from "@/lib/server-api";

type LegacyPostDetailRouteProps = {
  params: Promise<{ id: string }>;
};

export default async function LegacyPostDetailRoutePage({
  params,
}: LegacyPostDetailRouteProps) {
  const { id } = await params;
  const post = await getServerPost(Number(id));

  if (!post) {
    notFound();
  }

  const canonicalPath = buildPostPath(post);
  if (canonicalPath === `/posts/${id}`) {
    return <PostDetailPage postId={post.id} />;
  }

  permanentRedirect(canonicalPath);
}
