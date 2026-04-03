export type UserRole = "admin" | "moderator" | "user";

export interface UserStats {
  posts_count: number;
  likes_given_count?: number;
  likes_received_count: number;
  comments_count: number;
  views_received_count: number;
}

export interface UserSummary {
  id: number;
  name: string;
  username: string;
  role: UserRole;
  status_text: string;
  avatar_url: string;
  warning_count: number;
  is_banned: boolean;
}

export interface CurrentUser extends UserSummary {
  email: string;
  phone: string | null;
  bio: string;
  city: string;
  website_url: string;
  telegram_url: string;
  vk_url: string;
  instagram_url: string;
  can_access_admin: boolean;
  stats: UserStats;
}

export interface PostAuthor {
  id: number;
  name: string;
  avatar_url: string;
  role: UserRole;
  status_text: string;
}

export interface PostImage {
  id: number;
  image_url: string;
  position: number;
}

export interface PostComment {
  id: number;
  body: string;
  author: PostAuthor;
  created_at: string;
  updated_at: string;
  is_owner: boolean;
  can_edit: boolean;
}

export interface PostListItem {
  id: number;
  title: string;
  body: string;
  preview_text: string;
  kind: "news" | "event" | "story";
  published_at: string;
  is_published: boolean;
  author: PostAuthor;
  preview_image_url: string | null;
  likes_count: number;
  comments_count: number;
  favorites_count: number;
  view_count: number;
  is_liked: boolean;
  is_favorited: boolean;
  has_images: boolean;
  is_owner: boolean;
  can_edit: boolean;
  event_starts_at: string | null;
  event_ends_at: string | null;
  event_location: string;
}

export interface PostDetail extends Omit<PostListItem, "preview_text" | "preview_image_url"> {
  images: PostImage[];
  comments: PostComment[];
  is_published: boolean;
}

export interface NotificationItem {
  id: number;
  kind: string;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
  actor: {
    id: number;
    name: string;
    avatar_url: string;
    role: UserRole;
  };
  post_id: number | null;
  comment_id: number | null;
}

export interface NotificationResponse {
  unread_count: number;
  results: NotificationItem[];
}

export interface MapPointCategory {
  id: number;
  slug: string;
  title: string;
  sort_order: number;
  color: string;
}

export interface MapPointSummary {
  id: number;
  slug: string;
  title: string;
  short_description: string;
  latitude: number;
  longitude: number;
  categories: MapPointCategory[];
  primary_category: MapPointCategory | null;
  cover_image_url: string;
}

export interface MapPointImage {
  id: number;
  image_url: string;
  caption: string;
  position: number;
}

export interface MapPointReview {
  id: number;
  author_name: string;
  rating: number;
  body: string;
  created_at: string;
  images: MapPointImage[];
}

export interface MapPointDetail extends MapPointSummary {
  description: string;
  address: string;
  working_hours: string;
  images: MapPointImage[];
  reviews: MapPointReview[];
}

export interface MapOverviewResponse {
  bounds: {
    south: number;
    west: number;
    north: number;
    east: number;
  };
  categories: MapPointCategory[];
  points: MapPointSummary[];
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface AdminOverview {
  posts_count: number;
  published_posts_count: number;
  draft_posts_count: number;
  map_points_count: number;
  active_map_points_count: number;
  hidden_map_points_count: number;
  users_count: number;
  banned_users_count: number;
  admins_count: number;
}

export interface AdminUser extends UserSummary {
  email: string;
  phone: string | null;
  city: string;
  is_active: boolean;
  is_superuser: boolean;
  date_joined: string;
  last_login: string | null;
  can_access_admin: boolean;
}

export interface AdminMapPoint {
  id: number;
  slug: string;
  title: string;
  short_description: string;
  description: string;
  address: string;
  working_hours: string;
  latitude: number;
  longitude: number;
  categories: MapPointCategory[];
  primary_category: MapPointCategory | null;
  images: MapPointImage[];
  is_active: boolean;
  sort_order: number;
  review_count: number;
  created_at: string;
  updated_at: string;
}

export interface AuthSession {
  access: string;
  refresh: string;
  user: CurrentUser;
}

export interface FeedFilters {
  search?: string;
  ordering?: "recommended" | "recent" | "popular";
  kind?: "news" | "event" | "story";
  author_id?: number;
  favorites_only?: boolean;
  has_images?: boolean;
  event_scope?: "all" | "today" | "week" | "upcoming";
  page?: number;
}

export interface ProfileUpdatePayload {
  username?: string;
  email?: string;
  display_name?: string;
  phone?: string | null;
  avatar_url?: string;
  status_text?: string;
  bio?: string;
  city?: string;
  website_url?: string;
  telegram_url?: string;
  vk_url?: string;
  instagram_url?: string;
}

export interface PostWritePayload {
  title?: string;
  body?: string;
  kind?: "news" | "event" | "story";
  is_published?: boolean;
  image_urls?: string[];
  event_starts_at?: string | null;
  event_ends_at?: string | null;
  event_location?: string;
}

export interface AdminMapPointWritePayload {
  slug: string;
  title: string;
  short_description: string;
  description: string;
  address: string;
  working_hours: string;
  latitude: number;
  longitude: number;
  is_active: boolean;
  sort_order: number;
  category_ids: number[];
  image_urls: string[];
}
