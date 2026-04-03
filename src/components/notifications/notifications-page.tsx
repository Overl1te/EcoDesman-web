"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { useAuth } from "@/components/providers/auth-provider";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingBlock } from "@/components/ui/loading-block";
import { listNotifications, readAllNotifications } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import type { NotificationResponse } from "@/lib/types";

export function NotificationsPage() {
  const { isAuthenticated, openAuthModal } = useAuth();
  const [data, setData] = useState<NotificationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await listNotifications());
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Не удалось загрузить уведомления");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      void load();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  return (
    <AppShell
      title="Уведомления"
      actions={
        <button
          type="button"
          className="button button-muted"
          onClick={async () => {
            await readAllNotifications();
            await load();
          }}
        >
          Отметить все прочитанным
        </button>
      }
    >
      {!isAuthenticated ? (
        <EmptyState
          title="Нужен вход"
          description="Уведомления доступны только авторизованным пользователям."
          action={
            <button type="button" className="button button-primary" onClick={() => openAuthModal()}>
              Войти
            </button>
          }
        />
      ) : null}

      {isAuthenticated ? (
        <>
          {loading ? <LoadingBlock label="Загружаю уведомления..." /> : null}
          {error ? <EmptyState title="Ошибка" description={error} /> : null}
          {!loading && !error ? (
            <section className="stack-list">
              {data?.results.length ? (
                data.results.map((notification) => (
                  <article
                    key={notification.id}
                    className={`panel notification-item ${notification.is_read ? "" : "is-unread"}`}
                  >
                    <div>
                      <p className="eyebrow">{formatDateTime(notification.created_at)}</p>
                      <h3>{notification.title}</h3>
                      <p className="muted">{notification.body}</p>
                    </div>
                    {notification.post_id ? (
                      <Link href={`/posts/${notification.post_id}`} className="button button-muted">
                        Открыть пост
                      </Link>
                    ) : null}
                  </article>
                ))
              ) : (
                <EmptyState
                  title="Уведомлений пока нет"
                  description="Когда на ваши публикации начнут реагировать, события появятся здесь."
                />
              )}
            </section>
          ) : null}
        </>
      ) : null}
    </AppShell>
  );
}
