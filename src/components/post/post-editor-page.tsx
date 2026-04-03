"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { useAuth } from "@/components/providers/auth-provider";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingBlock } from "@/components/ui/loading-block";
import { createPost, getPost, updatePost, uploadImages } from "@/lib/api";
import type { PostDetail, PostWritePayload } from "@/lib/types";

export function PostEditorPage({ postId }: { postId?: number }) {
  const router = useRouter();
  const { isAuthenticated, openAuthModal } = useAuth();
  const [loading, setLoading] = useState(Boolean(postId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existing, setExisting] = useState<PostDetail | null>(null);
  const [form, setForm] = useState<PostWritePayload>({
    title: "",
    body: "",
    kind: "news",
    is_published: true,
    event_location: "",
    event_starts_at: null,
    event_ends_at: null,
  });
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    if (!postId) {
      return;
    }

    void getPost(postId, true)
      .then((post) => {
        setExisting(post);
        setForm({
          title: post.title,
          body: post.body,
          kind: post.kind,
          is_published: post.is_published,
          event_location: post.event_location,
          event_starts_at: post.event_starts_at,
          event_ends_at: post.event_ends_at,
        });
      })
      .catch((nextError: Error) => setError(nextError.message))
      .finally(() => setLoading(false));
  }, [postId]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const uploadedUrls = files.length
        ? await uploadImages(files)
        : existing?.images.map((image) => image.image_url) ?? [];
      const payload: PostWritePayload = {
        ...form,
        image_urls: uploadedUrls,
      };
      const result = postId ? await updatePost(postId, payload) : await createPost(payload);
      router.push(`/posts/${result.id}`);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Не удалось сохранить публикацию");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell title={postId ? "Редактирование" : "Новый пост"}>
      {!isAuthenticated ? (
        <EmptyState
          title="Нужен вход"
          description="Создание и редактирование публикаций доступно только после авторизации."
          action={
            <button
              type="button"
              className="button button-primary"
              onClick={() => openAuthModal({ returnTo: postId ? `/posts/${postId}/edit` : "/posts/new" })}
            >
              Войти
            </button>
          }
        />
      ) : null}

      {isAuthenticated ? (
        <>
          {loading ? <LoadingBlock label="Загружаю редактор..." /> : null}
          {error && !loading ? <EmptyState title="Ошибка" description={error} /> : null}
          {!loading ? (
            <section className="panel">
              <form className="stack-list" onSubmit={submit}>
                <div className="two-columns">
                  <label className="field">
                    <span>Заголовок</span>
                    <input
                      value={form.title || ""}
                      onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                    />
                  </label>
                  <label className="field">
                    <span>Тип</span>
                    <select
                      value={form.kind || "news"}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          kind: event.target.value as PostWritePayload["kind"],
                        }))
                      }
                    >
                      <option value="news">Новость</option>
                      <option value="story">История</option>
                      <option value="event">Событие</option>
                    </select>
                  </label>
                </div>

                <label className="field">
                  <span>Текст</span>
                  <textarea
                    value={form.body || ""}
                    onChange={(event) => setForm((current) => ({ ...current, body: event.target.value }))}
                  />
                </label>

                {form.kind === "event" ? (
                  <div className="two-columns">
                    <label className="field">
                      <span>Локация</span>
                      <input
                        value={form.event_location || ""}
                        onChange={(event) =>
                          setForm((current) => ({ ...current, event_location: event.target.value }))
                        }
                      />
                    </label>
                    <label className="field">
                      <span>Начало</span>
                      <input
                        type="datetime-local"
                        value={toDateInput(form.event_starts_at)}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            event_starts_at: toIsoOrNull(event.target.value),
                          }))
                        }
                      />
                    </label>
                    <label className="field">
                      <span>Окончание</span>
                      <input
                        type="datetime-local"
                        value={toDateInput(form.event_ends_at)}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            event_ends_at: toIsoOrNull(event.target.value),
                          }))
                        }
                      />
                    </label>
                  </div>
                ) : null}

                <label className="field">
                  <span>Фотографии</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
                  />
                </label>

                {existing?.images.length && !files.length ? (
                  <div className="gallery-grid">
                    {existing.images.map((image) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={image.id}
                        src={image.image_url}
                        alt="Изображение публикации"
                        className="gallery-image"
                      />
                    ))}
                  </div>
                ) : null}

                <label className="toggle-checkbox">
                  <input
                    type="checkbox"
                    checked={Boolean(form.is_published)}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, is_published: event.target.checked }))
                    }
                  />
                  <span>Опубликовать сразу</span>
                </label>

                <button type="submit" className="button button-primary" disabled={saving}>
                  {saving ? "Сохраняю..." : "Сохранить"}
                </button>
              </form>
            </section>
          ) : null}
        </>
      ) : null}
    </AppShell>
  );
}

function toDateInput(value: string | null | undefined): string {
  if (!value) {
    return "";
  }
  return new Date(value).toISOString().slice(0, 16);
}

function toIsoOrNull(value: string): string | null {
  return value ? new Date(value).toISOString() : null;
}
