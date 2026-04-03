"use client";

import { API_BASE_URL } from "@/lib/config";
import { clearStoredSession, readStoredSession, writeStoredSession } from "@/lib/session";
import type {
  AdminMapPoint,
  AdminMapPointWritePayload,
  AdminOverview,
  AdminUser,
  AuthSession,
  CurrentUser,
  FeedFilters,
  MapPointDetail,
  MapPointCategory,
  MapOverviewResponse,
  NotificationResponse,
  PaginatedResponse,
  PostDetail,
  PostListItem,
  PostWritePayload,
  ProfileUpdatePayload,
  UserSummary,
} from "@/lib/types";

type RequestOptions = RequestInit & {
  auth?: boolean;
  retry?: boolean;
};

function buildUrl(path: string, searchParams?: URLSearchParams): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const query = searchParams?.toString();
  return `${API_BASE_URL}${normalizedPath}${query ? `?${query}` : ""}`;
}

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") ?? "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const detail =
      typeof data === "object" && data && "detail" in data
        ? String((data as { detail: unknown }).detail)
        : response.statusText || "Request failed";
    throw new ApiError(detail, response.status, data);
  }

  return data as T;
}

async function refreshAccessToken(): Promise<AuthSession | null> {
  const session = readStoredSession();
  if (!session?.refresh) {
    return null;
  }

  const response = await fetch(buildUrl("/auth/refresh"), {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh: session.refresh }),
  });

  if (!response.ok) {
    clearStoredSession();
    return null;
  }

  const tokenData = (await response.json()) as { access: string; refresh?: string };
  const refreshedUser = await fetchMe(tokenData.access);
  const nextSession: AuthSession = {
    access: tokenData.access,
    refresh: tokenData.refresh ?? session.refresh,
    user: refreshedUser,
  };
  writeStoredSession(nextSession);
  return nextSession;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const session = options.auth ? readStoredSession() : null;
  const headers = new Headers(options.headers ?? {});

  headers.set("Accept", "application/json");
  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (options.auth && session?.access) {
    headers.set("Authorization", `Bearer ${session.access}`);
  }

  const response = await fetch(buildUrl(path), {
    ...options,
    headers,
  });

  if (response.status === 401 && options.auth && options.retry !== false) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return request<T>(path, { ...options, retry: false });
    }
  }

  return parseResponse<T>(response);
}

export async function fetchMe(accessToken?: string): Promise<CurrentUser> {
  const token = accessToken ?? readStoredSession()?.access;
  if (!token) {
    throw new ApiError("Не найден access token", 401, null);
  }

  const response = await fetch(buildUrl("/auth/me"), {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return parseResponse<CurrentUser>(response);
}

export async function login(payload: { identifier: string; password: string }): Promise<AuthSession> {
  const session = await request<AuthSession>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  writeStoredSession(session);
  return session;
}

export async function register(payload: {
  username: string;
  email: string;
  display_name?: string;
  phone?: string;
  password: string;
  password_confirmation: string;
}): Promise<AuthSession> {
  const session = await request<AuthSession>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  writeStoredSession(session);
  return session;
}

export async function logout(): Promise<void> {
  const refresh = readStoredSession()?.refresh;
  if (refresh) {
    try {
      await request<void>("/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refresh }),
      });
    } catch {
      // ignore server logout errors, local state is still cleared
    }
  }
  clearStoredSession();
}

export async function requestPasswordReset(identifier: string): Promise<{ detail: string }> {
  return request("/auth/password-reset/request", {
    method: "POST",
    body: JSON.stringify({ identifier }),
  });
}

export async function changePassword(payload: {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}): Promise<AuthSession> {
  const session = await request<AuthSession>("/auth/change-password", {
    method: "POST",
    auth: true,
    body: JSON.stringify(payload),
  });
  writeStoredSession(session);
  return session;
}

function buildFeedApiSearchParams(filters: FeedFilters = {}): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.ordering) params.set("ordering", filters.ordering);
  if (filters.kind) params.set("kind", filters.kind);
  if (typeof filters.author_id === "number") params.set("author_id", String(filters.author_id));
  if (filters.favorites_only) params.set("favorites_only", "true");
  if (filters.has_images) params.set("has_images", "true");
  if (filters.event_scope) params.set("event_scope", filters.event_scope);
  if (filters.page) params.set("page", String(filters.page));
  return params;
}

export async function listPosts(filters: FeedFilters = {}, auth = false): Promise<PaginatedResponse<PostListItem>> {
  const params = buildFeedApiSearchParams(filters);
  const url = `/posts${params.size ? `?${params.toString()}` : ""}`;
  return request<PaginatedResponse<PostListItem>>(url, { auth });
}

export async function getPost(postId: number, auth = false): Promise<PostDetail> {
  return request<PostDetail>(`/posts/${postId}`, { auth });
}

export async function toggleLike(postId: number, isLiked: boolean): Promise<void> {
  await request(`/posts/${postId}/like`, {
    method: isLiked ? "DELETE" : "POST",
    auth: true,
  });
}

export async function toggleFavorite(postId: number, isFavorited: boolean): Promise<void> {
  await request(`/posts/${postId}/favorite`, {
    method: isFavorited ? "DELETE" : "POST",
    auth: true,
  });
}

export async function createComment(postId: number, body: string): Promise<void> {
  await request(`/posts/${postId}/comments`, {
    method: "POST",
    auth: true,
    body: JSON.stringify({ body }),
  });
}

export async function updateComment(
  postId: number,
  commentId: number,
  body: string,
): Promise<void> {
  await request(`/posts/${postId}/comments/${commentId}`, {
    method: "PATCH",
    auth: true,
    body: JSON.stringify({ body }),
  });
}

export async function deleteComment(postId: number, commentId: number): Promise<void> {
  await request(`/posts/${postId}/comments/${commentId}`, {
    method: "DELETE",
    auth: true,
  });
}

export async function createPost(payload: PostWritePayload): Promise<PostDetail> {
  return request<PostDetail>("/posts", {
    method: "POST",
    auth: true,
    body: JSON.stringify(payload),
  });
}

export async function updatePost(postId: number, payload: PostWritePayload): Promise<PostDetail> {
  return request<PostDetail>(`/posts/${postId}`, {
    method: "PATCH",
    auth: true,
    body: JSON.stringify(payload),
  });
}

export async function deletePost(postId: number): Promise<void> {
  await request(`/posts/${postId}`, {
    method: "DELETE",
    auth: true,
  });
}

export async function getAdminOverview(): Promise<AdminOverview> {
  return request<AdminOverview>("/admin/overview", { auth: true });
}

export async function listAdminPosts(filters: {
  search?: string;
  kind?: "news" | "event" | "story";
  is_published?: boolean;
  page?: number;
}): Promise<PaginatedResponse<PostListItem>> {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.kind) params.set("kind", filters.kind);
  if (typeof filters.is_published === "boolean") {
    params.set("is_published", String(filters.is_published));
  }
  if (filters.page) params.set("page", String(filters.page));

  const url = `/admin/posts${params.size ? `?${params.toString()}` : ""}`;
  return request<PaginatedResponse<PostListItem>>(url, { auth: true });
}

export async function listAdminUsers(filters: {
  search?: string;
  role?: UserSummary["role"];
  status?: "active" | "banned" | "admin";
  page?: number;
}): Promise<PaginatedResponse<AdminUser>> {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.role) params.set("role", filters.role);
  if (filters.status) params.set("status", filters.status);
  if (filters.page) params.set("page", String(filters.page));

  const url = `/admin/users${params.size ? `?${params.toString()}` : ""}`;
  return request<PaginatedResponse<AdminUser>>(url, { auth: true });
}

export async function warnUser(userId: number): Promise<CurrentUser> {
  return request<CurrentUser>(`/users/${userId}/warn`, {
    method: "POST",
    auth: true,
  });
}

export async function banUser(userId: number): Promise<CurrentUser> {
  return request<CurrentUser>(`/users/${userId}/ban`, {
    method: "POST",
    auth: true,
  });
}

export async function unbanUser(userId: number): Promise<CurrentUser> {
  return request<CurrentUser>(`/users/${userId}/unban`, {
    method: "POST",
    auth: true,
  });
}

export async function updateUserRole(
  userId: number,
  role: UserSummary["role"],
): Promise<CurrentUser> {
  return request<CurrentUser>(`/users/${userId}/role`, {
    method: "PATCH",
    auth: true,
    body: JSON.stringify({ role }),
  });
}

export async function listNotifications(): Promise<NotificationResponse> {
  return request<NotificationResponse>("/notifications", { auth: true });
}

export async function readAllNotifications(): Promise<void> {
  await request("/notifications/read-all", {
    method: "POST",
    auth: true,
  });
}

export async function readNotification(notificationId: number): Promise<void> {
  await request(`/notifications/${notificationId}/read`, {
    method: "POST",
    auth: true,
  });
}

export async function listUsers(search: string): Promise<UserSummary[]> {
  const params = new URLSearchParams();
  if (search) {
    params.set("search", search);
  }
  const url = `/users${params.size ? `?${params.toString()}` : ""}`;
  return request<UserSummary[]>(url);
}

export async function getPublicProfile(userId: number, auth = false): Promise<CurrentUser> {
  return request<CurrentUser>(`/profiles/${userId}`, { auth });
}

export async function updateProfile(payload: ProfileUpdatePayload): Promise<CurrentUser> {
  const user = await request<CurrentUser>("/auth/me", {
    method: "PATCH",
    auth: true,
    body: JSON.stringify(payload),
  });

  const session = readStoredSession();
  if (session) {
    writeStoredSession({ ...session, user });
  }
  return user;
}

export async function uploadImages(files: File[]): Promise<string[]> {
  const uploaded: string[] = [];

  for (const file of files) {
    const formData = new FormData();
    formData.append("file", file);
    const result = await request<{ url: string }>("/uploads/images", {
      method: "POST",
      auth: true,
      body: formData,
    });
    uploaded.push(result.url);
  }

  return uploaded;
}

export async function getMapOverview(): Promise<MapOverviewResponse> {
  return request<MapOverviewResponse>("/map/overview");
}

export async function getMapPointDetail(pointId: number): Promise<MapPointDetail> {
  return request<MapPointDetail>(`/map/points/${pointId}`);
}

export async function createMapPointReview(
  pointId: number,
  payload: { rating: number; body: string; image_urls?: string[] },
): Promise<void> {
  await request(`/map/points/${pointId}/reviews`, {
    method: "POST",
    auth: true,
    body: JSON.stringify(payload),
  });
}

export async function listAdminMapCategories(): Promise<MapPointCategory[]> {
  return request<MapPointCategory[]>("/admin/map/categories", { auth: true });
}

export async function listAdminMapPoints(filters: {
  search?: string;
  is_active?: boolean;
  category_id?: number;
  page_size?: number;
}): Promise<PaginatedResponse<AdminMapPoint>> {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (typeof filters.is_active === "boolean") {
    params.set("is_active", String(filters.is_active));
  }
  if (typeof filters.category_id === "number") {
    params.set("category_id", String(filters.category_id));
  }
  if (typeof filters.page_size === "number") {
    params.set("page_size", String(filters.page_size));
  }

  const url = `/admin/map/points${params.size ? `?${params.toString()}` : ""}`;
  return request<PaginatedResponse<AdminMapPoint>>(url, { auth: true });
}

export async function createAdminMapPoint(
  payload: AdminMapPointWritePayload,
): Promise<AdminMapPoint> {
  return request<AdminMapPoint>("/admin/map/points", {
    method: "POST",
    auth: true,
    body: JSON.stringify(payload),
  });
}

export async function updateAdminMapPoint(
  pointId: number,
  payload: AdminMapPointWritePayload,
): Promise<AdminMapPoint> {
  return request<AdminMapPoint>(`/admin/map/points/${pointId}`, {
    method: "PATCH",
    auth: true,
    body: JSON.stringify(payload),
  });
}

export async function deleteAdminMapPoint(pointId: number): Promise<void> {
  await request(`/admin/map/points/${pointId}`, {
    method: "DELETE",
    auth: true,
  });
}
