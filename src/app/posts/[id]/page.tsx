import { PostDetailPage } from "@/components/post/post-detail-page";

export default async function PostDetailRoutePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  return <PostDetailPage postId={Number(resolvedParams.id)} />;
}
