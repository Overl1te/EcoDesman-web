"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleOff,
  Clock3,
  MapPin,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { useAuth } from "@/components/providers/auth-provider";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingBlock } from "@/components/ui/loading-block";
import { getEventCalendar, setEventCancelled } from "@/lib/api";
import { formatDate, formatDateTime } from "@/lib/format";
import type { CalendarEventEntry } from "@/lib/types";

const WEEKDAY_LABELS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

export function EventsFeedPage() {
  const router = useRouter();
  const { isAuthenticated, openAuthModal } = useAuth();
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState(() => toDateKey(new Date()));
  const [events, setEvents] = useState<CalendarEventEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingEventId, setUpdatingEventId] = useState<number | null>(null);

  const monthStart = useMemo(() => startOfMonth(new Date()), []);
  const monthLimit = useMemo(
    () => new Date(monthStart.getFullYear() + 10, monthStart.getMonth(), 1),
    [monthStart],
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    void getEventCalendar(
      visibleMonth.getFullYear(),
      visibleMonth.getMonth() + 1,
      isAuthenticated,
    )
      .then((response) => {
        if (cancelled) {
          return;
        }

        setEvents(response.events);
        const currentMonthKey = `${response.year}-${String(response.month).padStart(2, "0")}`;
        setSelectedDate((current) =>
          current.startsWith(currentMonthKey)
            ? current
            : response.events[0]?.event_date ?? `${currentMonthKey}-01`,
        );
      })
      .catch((nextError: Error) => {
        if (!cancelled) {
          setError(nextError.message);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, visibleMonth]);

  const eventsByDate = useMemo(() => {
    const grouped = new Map<string, CalendarEventEntry[]>();
    for (const event of events) {
      if (!event.event_date) {
        continue;
      }
      const bucket = grouped.get(event.event_date) ?? [];
      bucket.push(event);
      grouped.set(event.event_date, bucket);
    }
    return grouped;
  }, [events]);

  const selectedDayEvents = useMemo(
    () => sortEventsForAgenda(eventsByDate.get(selectedDate) ?? []),
    [eventsByDate, selectedDate],
  );
  const monthGrid = useMemo(() => buildMonthGrid(visibleMonth), [visibleMonth]);
  const monthLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("ru-RU", {
        month: "long",
        year: "numeric",
      }).format(visibleMonth),
    [visibleMonth],
  );

  const canGoPrev = compareMonth(visibleMonth, monthStart) > 0;
  const canGoNext = compareMonth(visibleMonth, monthLimit) < 0;
  const canJumpToToday =
    compareMonth(visibleMonth, monthStart) !== 0 || selectedDate !== toDateKey(new Date());

  const navigateMonth = (direction: -1 | 1) => {
    startTransition(() => {
      const nextMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + direction, 1);
      setVisibleMonth(nextMonth);
      setSelectedDate(toDateKey(nextMonth));
    });
  };

  const handleDayClick = (dateKey: string) => {
    const dayDate = new Date(`${dateKey}T00:00:00`);
    if (
      dayDate.getFullYear() !== visibleMonth.getFullYear()
      || dayDate.getMonth() !== visibleMonth.getMonth()
    ) {
      startTransition(() => {
        setVisibleMonth(startOfMonth(dayDate));
        setSelectedDate(dateKey);
      });
      return;
    }

    setSelectedDate(dateKey);
  };

  const handleCreateEvent = () => {
    if (!isAuthenticated) {
      openAuthModal({ returnTo: "/posts/new" });
      return;
    }

    router.push("/posts/new");
  };

  const handleJumpToToday = () => {
    const today = new Date();
    startTransition(() => {
      setVisibleMonth(startOfMonth(today));
      setSelectedDate(toDateKey(today));
    });
  };

  const handleToggleCancellation = async (eventItem: CalendarEventEntry) => {
    if (!isAuthenticated) {
      openAuthModal({ returnTo: "/events" });
      return;
    }

    setUpdatingEventId(eventItem.id);
    setError(null);

    try {
      const nextPost = await setEventCancelled(eventItem.id, !eventItem.is_event_cancelled);
      setEvents((current) =>
        current.map((item) =>
          item.id === nextPost.id
            ? {
                ...item,
                event_date: nextPost.event_date,
                event_starts_at: nextPost.event_starts_at,
                event_ends_at: nextPost.event_ends_at,
                event_location: nextPost.event_location,
                is_event_cancelled: nextPost.is_event_cancelled,
                event_cancelled_at: nextPost.event_cancelled_at,
              }
            : item,
        ),
      );
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Не удалось обновить статус мероприятия.");
    } finally {
      setUpdatingEventId(null);
    }
  };

  return (
    <AppShell
      title="Мероприятия"
      contentClassName="page-content-events"
      actions={
        <div className="events-topbar-actions">
          <button
            type="button"
            className="button button-muted"
            onClick={handleJumpToToday}
            disabled={!canJumpToToday}
          >
            Сегодня
          </button>
          <button type="button" className="button button-primary" onClick={handleCreateEvent}>
            Добавить мероприятие
          </button>
        </div>
      }
    >
      {loading ? <LoadingBlock label="Загружаю календарь мероприятий..." /> : null}
      {error && !loading ? <EmptyState title="Не удалось открыть календарь" description={error} /> : null}

      {!loading && !error ? (
        <section className="events-workspace">
          <div className="events-calendar-board panel">
            <header className="events-calendar-header">
              <div>
                <p className="eyebrow">Календарь</p>
                <h2>{capitalize(monthLabel)}</h2>
              </div>
              <div className="events-calendar-controls">
                <button
                  type="button"
                  className="button button-muted"
                  onClick={() => navigateMonth(-1)}
                  disabled={!canGoPrev}
                >
                  <ChevronLeft className="button-icon" />
                  <span>Назад</span>
                </button>
                <button
                  type="button"
                  className="button button-muted"
                  onClick={() => navigateMonth(1)}
                  disabled={!canGoNext}
                >
                  <span>Вперёд</span>
                  <ChevronRight className="button-icon" />
                </button>
              </div>
            </header>

            <div className="events-calendar-grid" role="grid">
              {WEEKDAY_LABELS.map((label) => (
                <div key={label} className="events-calendar-weekday">
                  {label}
                </div>
              ))}

              {monthGrid.map((day) => {
                const dayEvents = sortEventsForAgenda(eventsByDate.get(day.dateKey) ?? []);
                const isSelected = day.dateKey === selectedDate;

                return (
                  <button
                    key={day.dateKey}
                    type="button"
                    className={`events-calendar-day${day.inCurrentMonth ? "" : " is-muted"}${isSelected ? " is-selected" : ""}`}
                    onClick={() => handleDayClick(day.dateKey)}
                  >
                    <span className="events-calendar-day-number">{day.dayNumber}</span>
                    <span className="events-calendar-day-meta">
                      {dayEvents.length
                        ? `${dayEvents.length} ${pluralizeEvents(dayEvents.length)}`
                        : "Пусто"}
                    </span>
                    <span className="events-calendar-day-dots">
                      {dayEvents.slice(0, 3).map((eventItem) => (
                        <span
                          key={eventItem.id}
                          className={`events-calendar-dot${eventItem.is_event_cancelled ? " is-cancelled" : ""}`}
                        />
                      ))}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <aside className="events-agenda panel">
            <header className="events-agenda-header">
              <div>
                <p className="eyebrow">Выбранный день</p>
                <h2>{formatCalendarDay(selectedDate)}</h2>
              </div>
              <span className="events-agenda-pill">
                {selectedDayEvents.length
                  ? `${selectedDayEvents.length} ${pluralizeEvents(selectedDayEvents.length)}`
                  : "Без событий"}
              </span>
            </header>

            {selectedDayEvents.length ? (
              <div className="events-agenda-list">
                {selectedDayEvents.map((eventItem) => (
                  <article
                    key={eventItem.id}
                    className={`events-agenda-card${eventItem.is_event_cancelled ? " is-cancelled" : ""}`}
                  >
                    <div className="events-agenda-card-head">
                      <Link href={`/profiles/${eventItem.author.id}`} className="author-link">
                        <Avatar
                          user={{
                            avatar_url: eventItem.author.avatar_url,
                            name: eventItem.author.name,
                            username: eventItem.author.name,
                          }}
                          size="sm"
                        />
                        <span className="author-copy">
                          <strong>{eventItem.author.name}</strong>
                          <small>{eventItem.author.status_text || "Автор события"}</small>
                        </span>
                      </Link>
                      {eventItem.is_event_cancelled ? (
                        <span className="tag tag-danger">Отменено</span>
                      ) : (
                        <span className="tag">Запланировано</span>
                      )}
                    </div>

                    <div className="events-agenda-card-body">
                      <h3>{eventItem.title || "Мероприятие без заголовка"}</h3>
                      <p>
                        {eventItem.body
                          || "Откройте карточку события, чтобы посмотреть полное описание и детали."}
                      </p>
                    </div>

                    <div className="events-agenda-card-meta">
                      <span className="metric-item">
                        <CalendarDays className="meta-icon" />
                        <span>{formatCalendarDay(eventItem.event_date)}</span>
                      </span>
                      {eventItem.event_starts_at ? (
                        <span className="metric-item">
                          <Clock3 className="meta-icon" />
                          <span>{formatDateTime(eventItem.event_starts_at)}</span>
                        </span>
                      ) : null}
                      {eventItem.event_location ? (
                        <span className="metric-item">
                          <MapPin className="meta-icon" />
                          <span>{eventItem.event_location}</span>
                        </span>
                      ) : null}
                      {eventItem.is_event_cancelled && eventItem.event_cancelled_at ? (
                        <span className="metric-item">
                          <CircleOff className="meta-icon" />
                          <span>Отменено {formatDateTime(eventItem.event_cancelled_at)}</span>
                        </span>
                      ) : null}
                    </div>

                    <div className="events-agenda-card-actions">
                      <Link href={`/posts/${eventItem.id}`} className="button button-inline button-primary">
                        Открыть пост
                      </Link>
                      {eventItem.can_edit ? (
                        <button
                          type="button"
                          className={`button button-inline ${eventItem.is_event_cancelled ? "button-muted" : "button-ghost"}`}
                          onClick={() => void handleToggleCancellation(eventItem)}
                          disabled={updatingEventId === eventItem.id}
                        >
                          {updatingEventId === eventItem.id
                            ? "Сохраняю..."
                            : eventItem.is_event_cancelled
                              ? "Вернуть в календарь"
                              : "Отменить мероприятие"}
                        </button>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="events-agenda-empty">
                <strong>На этот день событий нет</strong>
                <p>Выберите другую дату в календаре или создайте новое мероприятие.</p>
              </div>
            )}
          </aside>
        </section>
      ) : null}
    </AppShell>
  );
}

function buildMonthGrid(
  monthDate: Date,
): Array<{ dateKey: string; dayNumber: number; inCurrentMonth: boolean }> {
  const firstDay = startOfMonth(monthDate);
  const firstWeekday = (firstDay.getDay() + 6) % 7;
  const gridStart = new Date(firstDay);
  gridStart.setDate(firstDay.getDate() - firstWeekday);

  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(gridStart);
    day.setDate(gridStart.getDate() + index);
    const dateKey = toDateKey(day);
    return {
      dateKey,
      dayNumber: day.getDate(),
      inCurrentMonth: day.getMonth() === monthDate.getMonth(),
    };
  });
}

function startOfMonth(value: Date): Date {
  return new Date(value.getFullYear(), value.getMonth(), 1);
}

function compareMonth(left: Date, right: Date): number {
  return left.getFullYear() * 12 + left.getMonth() - (right.getFullYear() * 12 + right.getMonth());
}

function toDateKey(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatCalendarDay(dateKey: string | null | undefined): string {
  if (!dateKey) {
    return "Дата не указана";
  }

  return formatDate(`${dateKey}T00:00:00`, {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function capitalize(value: string): string {
  return value ? value[0].toUpperCase() + value.slice(1) : value;
}

function sortEventsForAgenda(events: CalendarEventEntry[]): CalendarEventEntry[] {
  return [...events].sort((left, right) => {
    if (left.is_event_cancelled !== right.is_event_cancelled) {
      return Number(left.is_event_cancelled) - Number(right.is_event_cancelled);
    }

    const leftDate = left.event_starts_at ?? left.event_date ?? "";
    const rightDate = right.event_starts_at ?? right.event_date ?? "";
    return leftDate.localeCompare(rightDate);
  });
}

function pluralizeEvents(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return "событие";
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return "события";
  }

  return "событий";
}
