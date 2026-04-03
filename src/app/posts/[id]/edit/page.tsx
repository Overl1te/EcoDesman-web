import { PostEditorPage } from "@/components/post/post-editor-page";

export default async function EditPostRoutePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  return <PostEditorPage postId={Number(resolvedParams.id)} />;
}
