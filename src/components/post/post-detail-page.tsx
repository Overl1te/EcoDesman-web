"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Bookmark,
  CalendarDays,
  Check,
  Eye,
  Heart,
  MessageCircle,
  PencilLine,
  Trash2,
  X,
} from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { useAuth } from "@/components/providers/auth-provider";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingBlock } from "@/components/ui/loading-block";
import {
  createComment,
  deleteComment,
  deletePost,
  getPost,
  toggleFavorite,
  toggleLike,
  updateComment,
} from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import type { PostComment, PostDetail } from "@/lib/types";

function getKindLabel(kind: PostDetail["kind"]) {
  if (kind === "event") {
    return "Событие";
  }

  if (kind === "story") {
    return "История";
  }

  return "Новость";
}

function wasEdited(comment: PostComment) {
  return comment.updated_at !== comment.created_at;
}

export function PostDetailPage({ postId }: { postId: number }) {
  const router = useRouter();
  const { isAuthenticated, openAuthModal } = useAuth();
  const [post, setPost] = useState<PostDetail | null>(null);
  const [commentBody, setCommentBody] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingCommentBody, setEditingCommentBody] = useState("");
  const [reactionBusy, setReactionBusy] = useState<"like" | "favorite" | "delete" | null>(null);
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentBusyId, setCommentBusyId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      setPost(await getPost(postId, isAuthenticated));
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Не удалось загрузить пост");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, postId]);

  useEffect(() => {
    void load();
  }, [load]);

  const primaryImageUrl = useMemo(() => post?.images[0]?.image_url ?? `/posts/${postId}`, [post, postId]);

  const resetCommentEditor = () => {
    setEditingCommentId(null);
    setEditingCommentBody("");
  };

  const submitComment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isAuthenticated) {
      openAuthModal({ returnTo: `/posts/${postId}` });
      return;
    }

    if (!commentBody.trim()) {
      return;
    }

    setCommentSubmitting(true);

    try {
      await createComment(postId, commentBody.trim());
      setCommentBody("");
      await load();
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleToggleLike = async () => {
    if (!post) {
      return;
    }

    if (!isAuthenticated) {
      openAuthModal({ returnTo: `/posts/${post.id}` });
      return;
    }

    setReactionBusy("like");

    try {
      await toggleLike(post.id, post.is_liked);
      await load();
    } finally {
      setReactionBusy(null);
    }
  };

  const handleToggleFavorite = async () => {
    if (!post) {
      return;
    }

    if (!isAuthenticated) {
      openAuthModal({ returnTo: `/posts/${post.id}` });
      return;
    }

    setReactionBusy("favorite");

    try {
      await toggleFavorite(post.id, post.is_favorited);
      await load();
    } finally {
      setReactionBusy(null);
    }
  };

  const handleDeletePost = async () => {
    if (!post) {
      return;
    }

    setReactionBusy("delete");

    try {
      await deletePost(post.id);
      router.push("/profile");
    } finally {
      setReactionBusy(null);
    }
  };

  const beginCommentEdit = (comment: PostComment) => {
    setEditingCommentId(comment.id);
    setEditingCommentBody(comment.body);
  };

  const handleCommentSave = async (commentId: number) => {
    if (!editingCommentBody.trim()) {
      return;
    }

    setCommentBusyId(commentId);

    try {
      await updateComment(postId, commentId, editingCommentBody.trim());
      resetCommentEditor();
      await load();
    } finally {
      setCommentBusyId(null);
    }
  };

  const handleCommentDelete = async (commentId: number) => {
    setCommentBusyId(commentId);

    try {
      await deleteComment(postId, commentId);
      if (editingCommentId === commentId) {
        resetCommentEditor();
      }
      await load();
    } finally {
      setCommentBusyId(null);
    }
  };

  return (
    <AppShell
      title={post?.title || "Публикация"}
      actions={
        post?.can_edit ? (
          <Link href={`/posts/${post.id}/edit`} className="button button-muted">
            <PencilLine className="button-icon" />
            <span>Редактировать</span>
          </Link>
        ) : null
      }
    >
      {loading ? <LoadingBlock label="Загружаю публикацию..." /> : null}
      {error ? <EmptyState title="Ошибка загрузки" description={error} /> : null}

      {post ? (
        <>
          <article className="panel stack-list">
            <header className="post-header">
              <Link href={`/profiles/${post.author.id}`} className="author-link">
                <Avatar
                  user={{
                    avatar_url: post.author.avatar_url,
                    name: post.author.name,
                    username: post.author.name,
                  }}
                />

                <span className="author-copy">
                  <strong>{post.author.name}</strong>
                  <span className="author-meta">
                    <CalendarDays className="meta-icon" />
                    <small>{formatDateTime(post.published_at)}</small>
                  </span>
                </span>
              </Link>

              <span className="tag">{getKindLabel(post.kind)}</span>
            </header>

            {post.title ? <h2>{post.title}</h2> : null}
            <div className="post-body">{post.body}</div>

            {post.images.length ? (
              <div className="gallery-grid">
                {post.images.map((image) => (
                  <a key={image.id} href={image.image_url} target="_blank" rel="noreferrer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image.image_url}
                      alt={post.title || "Изображение публикации"}
                      className="gallery-image"
                    />
                  </a>
                ))}
              </div>
            ) : null}

            <div className="meta-row">
              <span className="metric-item">
                <Heart className="meta-icon" />
                <span>{post.likes_count} лайков</span>
              </span>
              <span className="metric-item">
                <MessageCircle className="meta-icon" />
                <span>{post.comments_count} комментариев</span>
              </span>
              <span className="metric-item">
                <Bookmark className="meta-icon" />
                <span>{post.favorites_count} в избранном</span>
              </span>
              <span className="metric-item">
                <Eye className="meta-icon" />
                <span>{post.view_count} просмотров</span>
              </span>
            </div>

            <div className="post-actions">
              <button
                type="button"
                className={`button button-inline ${post.is_liked ? "button-primary" : "button-muted"}`}
                onClick={() => void handleToggleLike()}
                disabled={reactionBusy !== null}
              >
                <Heart className="button-icon" />
                <span>Лайк</span>
              </button>

              <button
                type="button"
                className={`button button-inline ${post.is_favorited ? "button-primary" : "button-muted"}`}
                onClick={() => void handleToggleFavorite()}
                disabled={reactionBusy !== null}
              >
                <Bookmark className="button-icon" />
                <span>{post.is_favorited ? "В избранном" : "В избранное"}</span>
              </button>

              <Link href={primaryImageUrl} className="button button-inline button-ghost">
                <ArrowUpRight className="button-icon" />
                <span>Открыть фото</span>
              </Link>

              {post.can_edit ? (
                <button
                  type="button"
                  className="button button-inline button-danger"
                  onClick={() => void handleDeletePost()}
                  disabled={reactionBusy !== null}
                >
                  <Trash2 className="button-icon" />
                  <span>Удалить</span>
                </button>
              ) : null}
            </div>
          </article>

          <section className="panel stack-list">
            <div className="section-row">
              <h3>Комментарии</h3>
            </div>

            {isAuthenticated ? (
              <form className="stack-list" onSubmit={submitComment}>
                <label className="field">
                  <span>Комментарий</span>
                  <textarea
                    value={commentBody}
                    onChange={(event) => setCommentBody(event.target.value)}
                    placeholder="Напишите, что думаете об этой публикации"
                  />
                </label>

                <button
                  type="submit"
                  className="button button-primary"
                  disabled={commentSubmitting}
                >
                  <MessageCircle className="button-icon" />
                  <span>{commentSubmitting ? "Отправляю..." : "Добавить комментарий"}</span>
                </button>
              </form>
            ) : (
              <EmptyState
                title="Войдите, чтобы комментировать"
                description="Авторизация откроет доступ к обсуждениям и реакциям."
                action={
                  <button
                    type="button"
                    className="button button-primary"
                    onClick={() => openAuthModal({ returnTo: `/posts/${post.id}` })}
                  >
                    Войти
                  </button>
                }
              />
            )}

            {post.comments.length ? (
              <div className="stack-list">
                {post.comments.map((comment) => {
                  const editing = editingCommentId === comment.id;
                  const busy = commentBusyId === comment.id;

                  return (
                    <article key={comment.id} className="comment-card">
                      <div className="comment-header">
                        <Link href={`/profiles/${comment.author.id}`} className="author-link">
                          <Avatar
                            user={{
                              avatar_url: comment.author.avatar_url,
                              name: comment.author.name,
                              username: comment.author.name,
                            }}
                            size="sm"
                          />

                          <span className="author-copy">
                            <strong>{comment.author.name}</strong>
                            <span className="comment-meta">
                              <span>{formatDateTime(comment.created_at)}</span>
                              {wasEdited(comment) ? <span className="chip">Изменён</span> : null}
                            </span>
                          </span>
                        </Link>

                        {comment.can_edit ? (
                          <div className="comment-actions">
                            {!editing ? (
                              <>
                                <button
                                  type="button"
                                  className="button button-inline button-muted"
                                  onClick={() => beginCommentEdit(comment)}
                                  disabled={busy}
                                >
                                  <PencilLine className="button-icon" />
                                  <span>Редактировать</span>
                                </button>
                                <button
                                  type="button"
                                  className="button button-inline button-ghost"
                                  onClick={() => void handleCommentDelete(comment.id)}
                                  disabled={busy}
                                >
                                  <Trash2 className="button-icon" />
                                  <span>Удалить</span>
                                </button>
                              </>
                            ) : null}
                          </div>
                        ) : null}
                      </div>

                      {editing ? (
                        <div className="comment-editor">
                          <label className="field">
                            <span>Редактирование комментария</span>
                            <textarea
                              value={editingCommentBody}
                              onChange={(event) => setEditingCommentBody(event.target.value)}
                            />
                          </label>

                          <div className="comment-actions">
                            <button
                              type="button"
                              className="button button-inline button-primary"
                              onClick={() => void handleCommentSave(comment.id)}
                              disabled={busy}
                            >
                              <Check className="button-icon" />
                              <span>Сохранить</span>
                            </button>
                            <button
                              type="button"
                              className="button button-inline button-muted"
                              onClick={resetCommentEditor}
                              disabled={busy}
                            >
                              <X className="button-icon" />
                              <span>Отмена</span>
                            </button>
                            <button
                              type="button"
                              className="button button-inline button-ghost"
                              onClick={() => void handleCommentDelete(comment.id)}
                              disabled={busy}
                            >
                              <Trash2 className="button-icon" />
                              <span>Удалить</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="comment-body">{comment.body}</p>
                      )}
                    </article>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                title="Комментариев пока нет"
                description="Станьте первым, кто оставит мнение о публикации."
              />
            )}
          </section>
        </>
      ) : null}
    </AppShell>
  );
}
