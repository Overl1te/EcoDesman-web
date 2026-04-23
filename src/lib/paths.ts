import type { CurrentUser, PostAuthor, PostDetail, PostListItem, UserSummary } from "@/lib/types";

type PublicUserLike = Pick<CurrentUser, "id" | "username">
  | Pick<UserSummary, "id" | "username">
  | Pick<PostAuthor, "id" | "username">;

type PublicPostLike = Pick<PostDetail, "id" | "slug" | "author">
  | Pick<PostListItem, "id" | "slug" | "author">;

function normalizePublicSegment(value: string | null | undefined): string {
  return (value || "").trim();
}

export function buildProfilePathFromParts({
  userId,
  username,
}: {
  userId: number;
  username?: string | null;
}): string {
  const publicUsername = normalizePublicSegment(username);
  return publicUsername ? `/${publicUsername}` : `/profiles/${userId}`;
}

export function buildProfilePath(user: PublicUserLike): string {
  return buildProfilePathFromParts({
    userId: user.id,
    username: user.username,
  });
}

export function buildPostPathFromParts({
  postId,
  postSlug,
  authorUsername,
}: {
  postId: number;
  postSlug?: string | null;
  authorUsername?: string | null;
}): string {
  const publicUsername = normalizePublicSegment(authorUsername);
  const publicPostSlug = normalizePublicSegment(postSlug);

  if (publicUsername && publicPostSlug) {
    return `/${publicUsername}/posts/${publicPostSlug}`;
  }

  return `/posts/${postId}`;
}

export function buildPostPath(post: PublicPostLike): string {
  return buildPostPathFromParts({
    postId: post.id,
    postSlug: post.slug,
    authorUsername: post.author.username,
  });
}

export function buildPostEditPath(postId: number): string {
  return `/posts/${postId}/edit`;
}
