"use client";

import Link from "next/link";
import { Shield, ShieldAlert, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { useAuth } from "@/components/providers/auth-provider";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingBlock } from "@/components/ui/loading-block";
import {
  banUser,
  createAdminMapPoint,
  deleteAdminMapPoint,
  deleteAdminUserMapMarker,
  deletePost,
  getAdminOverview,
  listAdminMapCategories,
  listAdminMapPoints,
  listAdminUserMapMarkers,
  listAdminPosts,
  listAdminUsers,
  unbanUser,
  updateAdminMapPoint,
  updateAdminUserMapMarker,
  updatePost,
  updateUserRole,
  warnUser,
} from "@/lib/api";
import { compactCount, formatDateTime } from "@/lib/format";
import type {
  AdminMapPoint,
  AdminMapPointWritePayload,
  AdminOverview,
  AdminUserMapMarker,
  AdminUser,
  MapPointCategory,
  PaginatedResponse,
  PostListItem,
  UserRole,
} from "@/lib/types";

type AdminTab = "posts" | "map" | "users";
type PublicationStatus = "all" | "published" | "draft";
type UserStatusFilter = "all" | "active" | "banned" | "admin";
type PointStatusFilter = "all" | "active" | "hidden";

interface MapPointFormState {
  slug: string;
  title: string;
  short_description: string;
  description: string;
  address: string;
  working_hours: string;
  latitude: string;
  longitude: string;
  is_active: boolean;
  sort_order: string;
  category_ids: number[];
  image_urls_text: string;
}

const POST_PAGE_SIZE = 20;
const USER_PAGE_SIZE = 20;

function createEmptyPointForm(): MapPointFormState {
  return {
    slug: "",
    title: "",
    short_description: "",
    description: "",
    address: "",
    working_hours: "",
    latitude: "",
    longitude: "",
    is_active: true,
    sort_order: "0",
    category_ids: [],
    image_urls_text: "",
  };
}

function mapPointToForm(point: AdminMapPoint): MapPointFormState {
  return {
    slug: point.slug,
    title: point.title,
    short_description: point.short_description,
    description: point.description,
    address: point.address,
    working_hours: point.working_hours,
    latitude: String(point.latitude),
    longitude: String(point.longitude),
    is_active: point.is_active,
    sort_order: String(point.sort_order),
    category_ids: point.categories.map((category) => category.id),
    image_urls_text: point.images.map((image) => image.image_url).join("\n"),
  };
}

function buildMapPointPayload(form: MapPointFormState): AdminMapPointWritePayload {
  return {
    slug: form.slug.trim(),
    title: form.title.trim(),
    short_description: form.short_description.trim(),
    description: form.description.trim(),
    address: form.address.trim(),
    working_hours: form.working_hours.trim(),
    latitude: Number(form.latitude),
    longitude: Number(form.longitude),
    is_active: form.is_active,
    sort_order: Number(form.sort_order) || 0,
    category_ids: form.category_ids,
    image_urls: form.image_urls_text
      .split("\n")
      .map((value) => value.trim())
      .filter(Boolean),
  };
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Не удалось выполнить действие";
}

function getRoleLabel(role: UserRole): string {
  if (role === "admin") {
    return "Админ";
  }

  if (role === "support") {
    return "Техподдержка";
  }

  if (role === "moderator") {
    return "Модератор";
  }

  return "Пользователь";
}

function getKindLabel(kind: PostListItem["kind"]): string {
  if (kind === "event") {
    return "Событие";
  }

  if (kind === "story") {
    return "История";
  }

  return "Новость";
}

export function AdminPage() {
  const { user, isAuthenticated, refreshUser, openAuthModal } = useAuth();
  const canAccessAdmin = Boolean(user?.can_access_admin);

  const [activeTab, setActiveTab] = useState<AdminTab>("posts");
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [overviewError, setOverviewError] = useState<string | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [mutationKey, setMutationKey] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const [posts, setPosts] = useState<PaginatedResponse<PostListItem> | null>(null);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsError, setPostsError] = useState<string | null>(null);
  const [postSearch, setPostSearch] = useState("");
  const [postKind, setPostKind] = useState<"all" | PostListItem["kind"]>("all");
  const [postPublicationStatus, setPostPublicationStatus] =
    useState<PublicationStatus>("all");
  const [postsPage, setPostsPage] = useState(1);

  const [users, setUsers] = useState<PaginatedResponse<AdminUser> | null>(null);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState("");
  const [userRole, setUserRole] = useState<"all" | UserRole>("all");
  const [userStatus, setUserStatus] = useState<UserStatusFilter>("all");
  const [usersPage, setUsersPage] = useState(1);

  const [categories, setCategories] = useState<MapPointCategory[]>([]);
  const [points, setPoints] = useState<PaginatedResponse<AdminMapPoint> | null>(null);
  const [pointsLoading, setPointsLoading] = useState(false);
  const [pointsError, setPointsError] = useState<string | null>(null);
  const [pointSearch, setPointSearch] = useState("");
  const [pointStatus, setPointStatus] = useState<PointStatusFilter>("all");
  const [selectedPointId, setSelectedPointId] = useState<number | "new">("new");
  const [pointForm, setPointForm] = useState<MapPointFormState>(createEmptyPointForm());
  const [userMarkers, setUserMarkers] = useState<PaginatedResponse<AdminUserMapMarker> | null>(null);
  const [userMarkersLoading, setUserMarkersLoading] = useState(false);
  const [userMarkersError, setUserMarkersError] = useState<string | null>(null);

  async function loadOverview() {
    setOverviewLoading(true);
    setOverviewError(null);

    try {
      setOverview(await getAdminOverview());
    } catch (error) {
      setOverviewError(getErrorMessage(error));
    } finally {
      setOverviewLoading(false);
    }
  }

  async function loadPosts(page = 1) {
    setPostsLoading(true);
    setPostsError(null);
    setPostsPage(page);

    try {
      setPosts(
        await listAdminPosts({
          page,
          search: postSearch.trim() || undefined,
          kind: postKind === "all" ? undefined : postKind,
          is_published:
            postPublicationStatus === "all"
              ? undefined
              : postPublicationStatus === "published",
        }),
      );
    } catch (error) {
      setPostsError(getErrorMessage(error));
    } finally {
      setPostsLoading(false);
    }
  }

  async function loadUsers(page = 1) {
    setUsersLoading(true);
    setUsersError(null);
    setUsersPage(page);

    try {
      setUsers(
        await listAdminUsers({
          page,
          search: userSearch.trim() || undefined,
          role: userRole === "all" ? undefined : userRole,
          status: userStatus === "all" ? undefined : userStatus,
        }),
      );
    } catch (error) {
      setUsersError(getErrorMessage(error));
    } finally {
      setUsersLoading(false);
    }
  }

  async function loadCategories() {
    try {
      setCategories(await listAdminMapCategories());
    } catch (error) {
      setGlobalError(getErrorMessage(error));
    }
  }

  async function loadPoints() {
    setPointsLoading(true);
    setPointsError(null);

    try {
      setPoints(
        await listAdminMapPoints({
          page_size: 100,
          search: pointSearch.trim() || undefined,
          is_active:
            pointStatus === "all"
              ? undefined
              : pointStatus === "active",
        }),
      );
    } catch (error) {
      setPointsError(getErrorMessage(error));
    } finally {
      setPointsLoading(false);
    }
  }

  async function loadUserMarkers() {
    setUserMarkersLoading(true);
    setUserMarkersError(null);

    try {
      setUserMarkers(
        await listAdminUserMapMarkers({
          page_size: 100,
          search: pointSearch.trim() || undefined,
          is_active:
            pointStatus === "all"
              ? undefined
              : pointStatus === "active",
        }),
      );
    } catch (error) {
      setUserMarkersError(getErrorMessage(error));
    } finally {
      setUserMarkersLoading(false);
    }
  }

  useEffect(() => {
    if (!canAccessAdmin) {
      return;
    }

    void Promise.all([
      loadOverview(),
      loadPosts(1),
      loadUsers(1),
      loadCategories(),
      loadPoints(),
      loadUserMarkers(),
    ]);
    // Initial admin bootstrap should run once after access is confirmed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canAccessAdmin]);

  useEffect(() => {
    if (selectedPointId === "new") {
      return;
    }

    const nextPoint = points?.results.find((point) => point.id === selectedPointId);
    if (!nextPoint) {
      setSelectedPointId("new");
      setPointForm(createEmptyPointForm());
    }
  }, [points, selectedPointId]);

  async function runMutation<T>(
    key: string,
    action: () => Promise<T>,
    onSuccess?: (result: T) => Promise<void> | void,
  ) {
    setMutationKey(key);
    setGlobalError(null);

    try {
      const result = await action();
      await onSuccess?.(result);
    } catch (error) {
      setGlobalError(getErrorMessage(error));
    } finally {
      setMutationKey(null);
    }
  }

  async function handleTogglePublished(post: PostListItem) {
    await runMutation(`post-publish-${post.id}`, async () => {
      await updatePost(post.id, { is_published: !post.is_published });
    }, async () => {
      await Promise.all([loadPosts(postsPage), loadOverview()]);
    });
  }

  async function handleDeletePost(postId: number) {
    if (!window.confirm("Удалить пост без возможности восстановления?")) {
      return;
    }

    await runMutation(`post-delete-${postId}`, async () => {
      await deletePost(postId);
    }, async () => {
      await Promise.all([loadPosts(postsPage), loadOverview()]);
    });
  }

  async function handleUserRoleChange(adminUser: AdminUser, role: UserRole) {
    await runMutation(`user-role-${adminUser.id}`, async () => {
      await updateUserRole(adminUser.id, role);
    }, async () => {
      await loadUsers(usersPage);
      if (user?.id === adminUser.id) {
        await refreshUser();
      }
    });
  }

  async function handleUserModeration(
    adminUser: AdminUser,
    action: "warn" | "ban" | "unban",
  ) {
    await runMutation(`user-${action}-${adminUser.id}`, async () => {
      if (action === "warn") {
        await warnUser(adminUser.id);
        return;
      }
      if (action === "ban") {
        await banUser(adminUser.id);
        return;
      }
      await unbanUser(adminUser.id);
    }, async () => {
      await Promise.all([loadUsers(usersPage), loadOverview()]);
      if (user?.id === adminUser.id) {
        await refreshUser();
      }
    });
  }

  function handlePointSelection(point: AdminMapPoint) {
    setSelectedPointId(point.id);
    setPointForm(mapPointToForm(point));
  }

  function resetPointEditor() {
    setSelectedPointId("new");
    setPointForm(createEmptyPointForm());
  }

  async function handleSavePoint() {
    const payload = buildMapPointPayload(pointForm);

    if (!payload.slug || !payload.title) {
      setGlobalError("Для точки нужны как минимум slug и название.");
      return;
    }
    if (Number.isNaN(payload.latitude) || Number.isNaN(payload.longitude)) {
      setGlobalError("Координаты точки должны быть числами.");
      return;
    }

    await runMutation(
      selectedPointId === "new" ? "point-create" : `point-save-${selectedPointId}`,
      async () => {
        if (selectedPointId === "new") {
          return createAdminMapPoint(payload);
        }

        return updateAdminMapPoint(selectedPointId, payload);
      },
      async (savedPoint) => {
        setSelectedPointId(savedPoint.id);
        setPointForm(mapPointToForm(savedPoint));
        await Promise.all([loadPoints(), loadOverview()]);
      },
    );
  }

  async function handleDeletePoint() {
    if (selectedPointId === "new") {
      return;
    }
    if (!window.confirm("Удалить точку карты?")) {
      return;
    }

    await runMutation(`point-delete-${selectedPointId}`, async () => {
      await deleteAdminMapPoint(selectedPointId);
    }, async () => {
      resetPointEditor();
      await Promise.all([loadPoints(), loadOverview()]);
    });
  }

  async function handleToggleUserMarker(marker: AdminUserMapMarker) {
    await runMutation(`user-marker-toggle-${marker.id}`, async () => {
      await updateAdminUserMapMarker(marker.id, { is_active: !marker.is_active });
    }, async () => {
      await Promise.all([loadUserMarkers(), loadOverview()]);
    });
  }

  async function handleDeleteUserMarker(marker: AdminUserMapMarker) {
    if (!window.confirm("Удалить пользовательскую метку вместе с комментариями?")) {
      return;
    }

    await runMutation(`user-marker-delete-${marker.id}`, async () => {
      await deleteAdminUserMapMarker(marker.id);
    }, async () => {
      await Promise.all([loadUserMarkers(), loadOverview()]);
    });
  }

  const hasMorePosts = Boolean(posts && posts.count > postsPage * POST_PAGE_SIZE);
  const hasMoreUsers = Boolean(users && users.count > usersPage * USER_PAGE_SIZE);

  if (!isAuthenticated) {
    return (
      <AppShell title="Админка">
        <EmptyState
          title="Нужен вход"
          description="Админка доступна только после авторизации."
          action={
            <button
              type="button"
              className="button button-primary"
              onClick={() => openAuthModal({ returnTo: "/admin/" })}
            >
              Войти
            </button>
          }
        />
      </AppShell>
    );
  }

  if (!canAccessAdmin) {
    return (
      <AppShell title="Админка">
        <EmptyState
          title="Недостаточно прав"
          description="Этот раздел открыт только для админов."
        />
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Админка"
      actions={
        <button
          type="button"
          className="button button-muted"
          onClick={() => {
            void loadOverview();
            if (activeTab === "posts") {
              void loadPosts(postsPage);
            }
            if (activeTab === "map") {
              void loadPoints();
              void loadUserMarkers();
            }
            if (activeTab === "users") {
              void loadUsers(usersPage);
            }
          }}
        >
          Обновить
        </button>
      }
    >
      <section className="panel profile-panel">
        <div className="section-row">
          <div>
            <p className="eyebrow">Admin</p>
            <h2 className="admin-heading">Управление контентом, точками и пользователями</h2>
          </div>
          <div className="admin-badges">
            <span className="admin-status is-positive">
              <Shield className="button-icon" />
              <span>Доступ подтверждён</span>
            </span>
          </div>
        </div>

        {globalError ? (
          <div className="form-banner is-error">
            <strong>Ошибка</strong>
            <p>{globalError}</p>
          </div>
        ) : null}

        {overviewLoading && !overview ? <LoadingBlock label="Загружаю админку..." /> : null}
        {overviewError ? (
          <div className="form-banner is-error">
            <strong>Не удалось загрузить админку</strong>
            <p>{overviewError}</p>
          </div>
        ) : null}

        {overview ? (
          <div className="admin-overview-grid">
            <div className="stat-card">
              <strong>{compactCount(overview.posts_count)} </strong>
              <span>Посты: </span>
              <small style={{color: '#a6a6a6'}}>
                {overview.published_posts_count} опубликовано, {overview.draft_posts_count} черновиков
              </small>
            </div>
            <div className="stat-card">
              <strong>{compactCount(overview.map_points_count)} </strong>
              <span>Точки карты: </span>
              <small style={{color: '#a6a6a6'}}>
                {overview.active_map_points_count} активных, {overview.hidden_map_points_count} скрытых
              </small>
            </div>
            <div className="stat-card">
              <strong>{compactCount(overview.user_markers_count ?? 0)} </strong>
              <span>Метки людей: </span>
              <small style={{color: '#a6a6a6'}}>
                {overview.active_user_markers_count ?? 0} показываются, {overview.hidden_user_markers_count ?? 0} скрыты
              </small>
            </div>
            <div className="stat-card">
              <strong>{compactCount(overview.users_count)} </strong>
              <span>Пользователи: </span>
              <small style={{color: '#a6a6a6'}}>
                {overview.admins_count} админов, {overview.banned_users_count} заблокировано
              </small>
            </div>
          </div>
        ) : null}
      </section>

      <section className="panel profile-panel">
        <div className="admin-tabs">
          <button
            type="button"
            className={`chip admin-tab-button ${activeTab === "posts" ? "is-active" : ""}`}
            onClick={() => setActiveTab("posts")}
          >
            Посты
          </button>
          <button
            type="button"
            className={`chip admin-tab-button ${activeTab === "map" ? "is-active" : ""}`}
            onClick={() => setActiveTab("map")}
          >
            Точки карты
          </button>
          <button
            type="button"
            className={`chip admin-tab-button ${activeTab === "users" ? "is-active" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            Пользователи
          </button>
        </div>

        {activeTab === "posts" ? (
          <div className="profile-panel">
            <form
              className="filters-toolbar"
              onSubmit={(event) => {
                event.preventDefault();
                void loadPosts(1);
              }}
            >
              <div className="filters-toolbar-head">
                <div>
                  <h3>Все публикации</h3>
                  <p className="muted">
                    Быстрая модерация, публикация черновиков и удаление постов.
                  </p>
                </div>
                <span className="filters-status">
                  {posts ? `${posts.count} записей` : "Без данных"}
                </span>
              </div>
              <div className="filters-toolbar-grid filters-toolbar-grid-events">
                <label className="field filter-field">
                  <span className="filter-label">Поиск</span>
                  <input
                    value={postSearch}
                    onChange={(event) => setPostSearch(event.target.value)}
                    placeholder="Заголовок, текст, автор"
                  />
                </label>
                <label className="field filter-field">
                  <span className="filter-label">Тип</span>
                  <select
                    value={postKind}
                    onChange={(event) =>
                      setPostKind(event.target.value as "all" | PostListItem["kind"])
                    }
                  >
                    <option value="all">Все типы</option>
                    <option value="news">Новости</option>
                    <option value="story">Истории</option>
                    <option value="event">События</option>
                  </select>
                </label>
                <label className="field filter-field">
                  <span className="filter-label">Статус</span>
                  <select
                    value={postPublicationStatus}
                    onChange={(event) =>
                      setPostPublicationStatus(event.target.value as PublicationStatus)
                    }
                  >
                    <option value="all">Все публикации</option>
                    <option value="published">Опубликованные</option>
                    <option value="draft">Черновики</option>
                  </select>
                </label>
                <div className="filter-submit-wrap">
                  <button type="submit" className="button button-primary filter-submit">
                    Показать
                  </button>
                </div>
              </div>
            </form>

            {postsLoading && !posts ? <LoadingBlock label="Загружаю посты..." /> : null}
            {postsError ? (
              <EmptyState
                title="Не удалось загрузить посты"
                description={postsError}
                action={
                  <button type="button" className="button button-primary" onClick={() => void loadPosts(1)}>
                    Повторить
                  </button>
                }
              />
            ) : null}

            <div className="admin-stack">
              {posts?.results.map((post) => (
                <article key={post.id} className="panel admin-card">
                  <div className="admin-card-head">
                    <div className="admin-card-copy">
                      <div className="section-row">
                        <h3>{post.title || "Без заголовка"}</h3>
                        <div className="admin-badges">
                          <span
                            className={`admin-status ${
                              post.is_published ? "is-positive" : "is-warning"
                            }`}
                          >
                            {post.is_published ? "Опубликован" : "Черновик"}
                          </span>
                          <span className="chip">{getKindLabel(post.kind)}</span>
                        </div>
                      </div>
                      <p className="muted">
                        {post.author.name} · {formatDateTime(post.published_at)}
                      </p>
                    </div>

                    <div className="post-actions">
                      <Link href={`/posts/${post.id}`} className="button button-muted button-inline">
                        Открыть
                      </Link>
                      <Link
                        href={`/posts/${post.id}/edit`}
                        className="button button-muted button-inline"
                      >
                        Редактировать
                      </Link>
                      <button
                        type="button"
                        className="button button-ghost button-inline"
                        disabled={mutationKey === `post-publish-${post.id}`}
                        onClick={() => void handleTogglePublished(post)}
                      >
                        {post.is_published ? "В черновик" : "Опубликовать"}
                      </button>
                      <button
                        type="button"
                        className="button button-danger button-inline"
                        disabled={mutationKey === `post-delete-${post.id}`}
                        onClick={() => void handleDeletePost(post.id)}
                      >
                        <Trash2 className="button-icon" />
                        <span>Удалить</span>
                      </button>
                    </div>
                  </div>

                  <p className="admin-card-text">{post.preview_text || post.body}</p>

                  <div className="metrics-row">
                    <span className="chip">Просмотры: {compactCount(post.view_count)}</span>
                    <span className="chip">Лайки: {compactCount(post.likes_count)}</span>
                    <span className="chip">Комментарии: {compactCount(post.comments_count)}</span>
                    <span className="chip">Избранное: {compactCount(post.favorites_count)}</span>
                  </div>
                </article>
              ))}
            </div>

            {posts && posts.count > 0 ? (
              <div className="pagination-row">
                <button
                  type="button"
                  className="button button-muted"
                  disabled={postsPage === 1 || postsLoading}
                  onClick={() => void loadPosts(postsPage - 1)}
                >
                  Назад
                </button>
                <span className="pagination-label">Страница {postsPage}</span>
                <button
                  type="button"
                  className="button button-muted"
                  disabled={!hasMorePosts || postsLoading}
                  onClick={() => void loadPosts(postsPage + 1)}
                >
                  Дальше
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
        {activeTab === "users" ? (
          <div className="profile-panel">
            <form
              className="filters-toolbar"
              onSubmit={(event) => {
                event.preventDefault();
                void loadUsers(1);
              }}
            >
              <div className="filters-toolbar-head">
                <div>
                  <h3>Аккаунты пользователей</h3>
                  <p className="muted">Смена ролей, предупреждения и блокировки.</p>
                </div>
                <span className="filters-status">
                  {users ? `${users.count} аккаунтов` : "Без данных"}
                </span>
              </div>
              <div className="filters-toolbar-grid filters-toolbar-grid-events">
                <label className="field filter-field">
                  <span className="filter-label">Поиск</span>
                  <input
                    value={userSearch}
                    onChange={(event) => setUserSearch(event.target.value)}
                    placeholder="Имя, логин, email, телефон"
                  />
                </label>
                <label className="field filter-field">
                  <span className="filter-label">Роль</span>
                  <select
                    value={userRole}
                    onChange={(event) => setUserRole(event.target.value as "all" | UserRole)}
                  >
                    <option value="all">Все роли</option>
                    <option value="admin">Админы</option>
                    <option value="support">Техподдержка</option>
                    <option value="moderator">Модераторы</option>
                    <option value="user">Пользователи</option>
                  </select>
                </label>
                <label className="field filter-field">
                  <span className="filter-label">Статус</span>
                  <select
                    value={userStatus}
                    onChange={(event) =>
                      setUserStatus(event.target.value as UserStatusFilter)
                    }
                  >
                    <option value="all">Все статусы</option>
                    <option value="active">Активные</option>
                    <option value="banned">Заблокированные</option>
                    <option value="admin">С доступом к админке</option>
                  </select>
                </label>
                <div className="filter-submit-wrap">
                  <button type="submit" className="button button-primary filter-submit">
                    Показать
                  </button>
                </div>
              </div>
            </form>

            {usersLoading && !users ? <LoadingBlock label="Загружаю пользователей..." /> : null}
            {usersError ? (
              <EmptyState
                title="Не удалось загрузить пользователей"
                description={usersError}
                action={
                  <button type="button" className="button button-primary" onClick={() => void loadUsers(1)}>
                    Повторить
                  </button>
                }
              />
            ) : null}

            <div className="admin-stack">
              {users?.results.map((adminUser) => (
                <article key={adminUser.id} className="panel admin-card">
                  <div className="admin-card-head">
                    <div className="admin-card-copy">
                      <div className="section-row">
                        <h3>{adminUser.name || adminUser.username}</h3>
                        <div className="admin-badges">
                          <span
                            className={`admin-status ${
                              adminUser.is_banned ? "is-danger" : "is-positive"
                            }`}
                          >
                            {adminUser.is_banned ? "Заблокирован" : "Активен"}
                          </span>
                          {adminUser.can_access_admin ? (
                            <span className="admin-status is-warning">
                              <ShieldAlert className="button-icon" />
                              <span>Админ-доступ</span>
                            </span>
                          ) : null}
                          {adminUser.can_access_support ? (
                            <span className="admin-status is-warning">
                              <ShieldAlert className="button-icon" />
                              <span>Техподдержка</span>
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <p className="muted">
                        @{adminUser.username} · {adminUser.email}
                      </p>
                      <p className="muted">
                        {adminUser.city || "Город не указан"} · предупреждений:{" "}
                        {adminUser.warning_count}
                      </p>
                    </div>
                    <div className="admin-user-controls">
                      <label className="field field-inline">
                        <span className="filter-label">Роль</span>
                        <select
                          value={adminUser.role}
                          disabled={mutationKey === `user-role-${adminUser.id}`}
                          onChange={(event) =>
                            void handleUserRoleChange(
                              adminUser,
                              event.target.value as UserRole,
                            )
                          }
                        >
                          <option value="admin">Админ</option>
                          <option value="support">Техподдержка</option>
                          <option value="moderator">Модератор</option>
                          <option value="user">Пользователь</option>
                        </select>
                      </label>
                    </div>
                  </div>

                  <div className="metrics-row">
                    <span className="chip">{getRoleLabel(adminUser.role)}</span>
                    <span className="chip">
                      Зарегистрирован: {formatDateTime(adminUser.date_joined)}
                    </span>
                    {adminUser.last_login ? (
                      <span className="chip">
                        Последний вход: {formatDateTime(adminUser.last_login)}
                      </span>
                    ) : null}
                  </div>

                  <div className="post-actions">
                    <button
                      type="button"
                      className="button button-muted button-inline"
                      disabled={mutationKey === `user-warn-${adminUser.id}`}
                      onClick={() => void handleUserModeration(adminUser, "warn")}
                    >
                      Предупредить
                    </button>
                    {adminUser.is_banned ? (
                      <button
                        type="button"
                        className="button button-ghost button-inline"
                        disabled={mutationKey === `user-unban-${adminUser.id}`}
                        onClick={() => void handleUserModeration(adminUser, "unban")}
                      >
                        Разблокировать
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="button button-danger button-inline"
                        disabled={mutationKey === `user-ban-${adminUser.id}`}
                        onClick={() => void handleUserModeration(adminUser, "ban")}
                      >
                        Заблокировать
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>

            {users && users.count > 0 ? (
              <div className="pagination-row">
                <button
                  type="button"
                  className="button button-muted"
                  disabled={usersPage === 1 || usersLoading}
                  onClick={() => void loadUsers(usersPage - 1)}
                >
                  Назад
                </button>
                <span className="pagination-label">Страница {usersPage}</span>
                <button
                  type="button"
                  className="button button-muted"
                  disabled={!hasMoreUsers || usersLoading}
                  onClick={() => void loadUsers(usersPage + 1)}
                >
                  Дальше
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
        {activeTab === "map" ? (
          <div className="admin-map-layout">
            <section className="panel profile-panel">
              <form
                className="filters-toolbar"
                onSubmit={(event) => {
                  event.preventDefault();
                  void Promise.all([loadPoints(), loadUserMarkers()]);
                }}
              >
                <div className="filters-toolbar-head">
                  <div>
                    <h3>Точки карты</h3>
                    <p className="muted">Создание, редактирование и скрытие точек.</p>
                  </div>
                  <button
                    type="button"
                    className="button button-primary"
                    onClick={resetPointEditor}
                  >
                    Новая точка
                  </button>
                </div>
                <div className="filters-toolbar-grid filters-toolbar-grid-admin-map">
                  <label className="field filter-field">
                    <span className="filter-label">Поиск</span>
                    <input
                      value={pointSearch}
                      onChange={(event) => setPointSearch(event.target.value)}
                      placeholder="Slug, название, адрес"
                    />
                  </label>
                  <label className="field filter-field">
                    <span className="filter-label">Статус</span>
                    <select
                      value={pointStatus}
                      onChange={(event) =>
                        setPointStatus(event.target.value as PointStatusFilter)
                      }
                    >
                      <option value="all">Все точки</option>
                      <option value="active">Активные</option>
                      <option value="hidden">Скрытые</option>
                    </select>
                  </label>
                  <div className="filter-submit-wrap">
                    <button type="submit" className="button button-primary filter-submit">
                      Показать
                    </button>
                  </div>
                </div>
              </form>

              {pointsLoading && !points ? <LoadingBlock label="Загружаю точки..." /> : null}
              {pointsError ? (
                <EmptyState
                  title="Не удалось загрузить точки"
                  description={pointsError}
                  action={
                    <button type="button" className="button button-primary" onClick={() => void loadPoints()}>
                      Повторить
                    </button>
                  }
                />
              ) : null}

              <div className="admin-point-list">
                {points?.results.map((point) => (
                  <button
                    key={point.id}
                    type="button"
                    className={`point-row ${selectedPointId === point.id ? "is-active" : ""}`}
                    onClick={() => handlePointSelection(point)}
                  >
                    <div className="section-row">
                      <strong>{point.title}</strong>
                      <span
                        className={`admin-status ${
                          point.is_active ? "is-positive" : "is-warning"
                        }`}
                      >
                        {point.is_active ? "Активна" : "Скрыта"}
                      </span>
                    </div>
                    <p className="muted">{point.address || point.slug}</p>
                    <div className="map-category-row">
                      {point.categories.map((category) => (
                        <span key={category.id} className="map-category-chip">
                          <span
                            className="map-category-chip-dot"
                            style={{ backgroundColor: category.color }}
                          />
                          <span>{category.title}</span>
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>

              <div className="section-row admin-subsection-row">
                <div>
                  <h3>Пользовательские метки</h3>
                  <p className="muted">
                    Модерация мест, которые пользователи добавили с карты.
                  </p>
                </div>
                <span className="filters-status">
                  {userMarkers ? `${userMarkers.count} меток` : "Без данных"}
                </span>
              </div>

              {userMarkersLoading && !userMarkers ? (
                <LoadingBlock label="Загружаю пользовательские метки..." />
              ) : null}
              {userMarkersError ? (
                <EmptyState
                  title="Не удалось загрузить пользовательские метки"
                  description={userMarkersError}
                  action={
                    <button type="button" className="button button-primary" onClick={() => void loadUserMarkers()}>
                      Повторить
                    </button>
                  }
                />
              ) : null}

              <div className="admin-point-list">
                {userMarkers?.results.map((marker) => (
                  <article key={marker.id} className="point-row">
                    <div className="section-row">
                      <strong>{marker.title}</strong>
                      <span
                        className={`admin-status ${
                          marker.is_active && marker.is_public ? "is-positive" : "is-warning"
                        }`}
                      >
                        {marker.is_active && marker.is_public ? "Показывается" : "Скрыта"}
                      </span>
                    </div>
                    <p className="muted">
                      {marker.author?.name || marker.author?.username || "Пользователь"} ·{" "}
                      {marker.latitude.toFixed(6)}, {marker.longitude.toFixed(6)}
                    </p>
                    <p className="admin-card-text">{marker.description}</p>
                    <div className="metrics-row">
                      <span className="chip">{marker.comments_count} комментариев</span>
                      <span className="chip">{marker.reports_count} жалоб</span>
                      <span className="chip">{marker.media.length} медиа</span>
                    </div>
                    <div className="post-actions">
                      <button
                        type="button"
                        className="button button-muted button-inline"
                        disabled={mutationKey === `user-marker-toggle-${marker.id}`}
                        onClick={() => void handleToggleUserMarker(marker)}
                      >
                        {marker.is_active ? "Скрыть" : "Показать"}
                      </button>
                      <button
                        type="button"
                        className="button button-danger button-inline"
                        disabled={mutationKey === `user-marker-delete-${marker.id}`}
                        onClick={() => void handleDeleteUserMarker(marker)}
                      >
                        Удалить
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="panel profile-panel">
              <div className="section-row">
                <div>
                  <h3>{selectedPointId === "new" ? "Новая точка" : "Редактор точки"}</h3>
                  <p className="muted">
                    Категории, координаты, изображения и статус показа на карте.
                  </p>
                </div>
                {selectedPointId !== "new" ? (
                  <button
                    type="button"
                    className="button button-danger"
                    disabled={mutationKey === `point-delete-${selectedPointId}`}
                    onClick={() => void handleDeletePoint()}
                  >
                    Удалить
                  </button>
                ) : null}
              </div>

              <div className="two-columns">
                <label className="field">
                  <span>Название</span>
                  <input
                    value={pointForm.title}
                    onChange={(event) =>
                      setPointForm((current) => ({ ...current, title: event.target.value }))
                    }
                    placeholder="Экопункт на Покровке"
                  />
                </label>
                <label className="field">
                  <span>Slug</span>
                  <input
                    value={pointForm.slug}
                    onChange={(event) =>
                      setPointForm((current) => ({ ...current, slug: event.target.value }))
                    }
                    placeholder="pokrovka-ecopoint"
                  />
                </label>
              </div>

              <label className="field">
                <span>Краткое описание</span>
                <input
                  value={pointForm.short_description}
                  onChange={(event) =>
                    setPointForm((current) => ({
                      ...current,
                      short_description: event.target.value,
                    }))
                  }
                  placeholder="Что принимает точка и чем она полезна"
                />
              </label>

              <label className="field">
                <span>Описание</span>
                <textarea
                  value={pointForm.description}
                  onChange={(event) =>
                    setPointForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Подробности для пользователей"
                />
              </label>

              <div className="two-columns">
                <label className="field">
                  <span>Адрес</span>
                  <input
                    value={pointForm.address}
                    onChange={(event) =>
                      setPointForm((current) => ({ ...current, address: event.target.value }))
                    }
                    placeholder="Большая Покровская, 12"
                  />
                </label>
                <label className="field">
                  <span>Часы работы</span>
                  <input
                    value={pointForm.working_hours}
                    onChange={(event) =>
                      setPointForm((current) => ({
                        ...current,
                        working_hours: event.target.value,
                      }))
                    }
                    placeholder="пн-пт 10:00-18:00"
                  />
                </label>
              </div>

              <div className="two-columns">
                <label className="field">
                  <span>Широта</span>
                  <input
                    value={pointForm.latitude}
                    onChange={(event) =>
                      setPointForm((current) => ({ ...current, latitude: event.target.value }))
                    }
                    placeholder="56.320123"
                  />
                </label>
                <label className="field">
                  <span>Долгота</span>
                  <input
                    value={pointForm.longitude}
                    onChange={(event) =>
                      setPointForm((current) => ({ ...current, longitude: event.target.value }))
                    }
                    placeholder="44.012345"
                  />
                </label>
              </div>

              <div className="two-columns">
                <label className="field">
                  <span>Порядок сортировки</span>
                  <input
                    value={pointForm.sort_order}
                    onChange={(event) =>
                      setPointForm((current) => ({ ...current, sort_order: event.target.value }))
                    }
                    placeholder="0"
                  />
                </label>
                <label className="field">
                  <span>Статус</span>
                  <select
                    value={pointForm.is_active ? "active" : "hidden"}
                    onChange={(event) =>
                      setPointForm((current) => ({
                        ...current,
                        is_active: event.target.value === "active",
                      }))
                    }
                  >
                    <option value="active">Активна</option>
                    <option value="hidden">Скрыта</option>
                  </select>
                </label>
              </div>

              <div className="field">
                <span>Категории</span>
                <div className="admin-category-grid">
                  {categories.map((category) => {
                    const isSelected = pointForm.category_ids.includes(category.id);

                    return (
                      <label
                        key={category.id}
                        className={`map-category-chip admin-category-option ${
                          isSelected ? "is-active" : ""
                        }`}
                      >
                        <input
                          className="visually-hidden"
                          type="checkbox"
                          checked={isSelected}
                          onChange={(event) => {
                            setPointForm((current) => ({
                              ...current,
                              category_ids: event.target.checked
                                ? [...current.category_ids, category.id]
                                : current.category_ids.filter((item) => item !== category.id),
                            }));
                          }}
                        />
                        <span
                          className="map-category-chip-dot"
                          style={{ backgroundColor: category.color }}
                        />
                        <span>{category.title}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <label className="field">
                <span>Изображения</span>
                <textarea
                  value={pointForm.image_urls_text}
                  onChange={(event) =>
                    setPointForm((current) => ({
                      ...current,
                      image_urls_text: event.target.value,
                    }))
                  }
                  placeholder="По одной ссылке на строку"
                />
              </label>

              <div className="post-actions">
                <button
                  type="button"
                  className="button button-muted"
                  onClick={resetPointEditor}
                >
                  Очистить форму
                </button>
                <button
                  type="button"
                  className="button button-primary"
                  disabled={
                    mutationKey === "point-create" ||
                    (selectedPointId !== "new" &&
                      mutationKey === `point-save-${selectedPointId}`)
                  }
                  onClick={() => void handleSavePoint()}
                >
                  {selectedPointId === "new" ? "Создать точку" : "Сохранить точку"}
                </button>
              </div>
            </section>
          </div>
        ) : null}
      </section>
    </AppShell>
  );
}
