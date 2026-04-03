"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Bookmark,
  CalendarDays,
  Eye,
  Heart,
  MapPin,
  MessageCircle,
} from "lucide-react";
import { useState } from "react";

import { useAuth } from "@/components/providers/auth-provider";
import { Avatar } from "@/components/ui/avatar";
import { toggleFavorite, toggleLike } from "@/lib/api";
import { compactCount, formatDateTime } from "@/lib/format";
import type { PostListItem } from "@/lib/types";

function getKindLabel(kind: PostListItem["kind"]) {
  if (kind === "event") {
    return "Событие";
  }

  if (kind === "story") {
    return "История";
  }

  return "Новость";
}

export function PostCard({
  post,
  onUpdated,
}: {
  post: PostListItem;
  onUpdated?: (nextPost: PostListItem) => void;
}) {
  const { isAuthenticated, openAuthModal } = useAuth();
  const [busy, setBusy] = useState<"like" | "favorite" | null>(null);

  const handleLike = async () => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }

    setBusy("like");

    try {
      await toggleLike(post.id, post.is_liked);
      onUpdated?.({
        ...post,
        is_liked: !post.is_liked,
        likes_count: post.likes_count + (post.is_liked ? -1 : 1),
      });
    } finally {
      setBusy(null);
    }
  };

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }

    setBusy("favorite");

    try {
      await toggleFavorite(post.id, post.is_favorited);
      onUpdated?.({
        ...post,
        is_favorited: !post.is_favorited,
        favorites_count: post.favorites_count + (post.is_favorited ? -1 : 1),
      });
    } finally {
      setBusy(null);
    }
  };

  return (
    <article className="post-card">
      <header className="post-card-header">
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

      <Link href={`/posts/${post.id}`} className="post-content">
        {post.title ? <h3>{post.title}</h3> : null}
        <p>{post.preview_text || post.body}</p>
      </Link>

      {post.preview_image_url ? (
        <Link href={`/posts/${post.id}`} className="post-image-link">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.preview_image_url}
            alt={post.title || "Изображение публикации"}
            className="post-image"
          />
        </Link>
      ) : null}

      {post.kind === "event" && (post.event_location || post.event_starts_at) ? (
        <div className="meta-row">
          {post.event_location ? (
            <span className="meta-item">
              <MapPin className="meta-icon" />
              <span>{post.event_location}</span>
            </span>
          ) : null}

          {post.event_starts_at ? (
            <span className="meta-item">
              <CalendarDays className="meta-icon" />
              <span>{formatDateTime(post.event_starts_at)}</span>
            </span>
          ) : null}
        </div>
      ) : null}

      <footer className="post-card-footer">
        <div className="metrics-row">
          <span className="metric-item">
            <Heart className="meta-icon" />
            <span>{compactCount(post.likes_count)} лайков</span>
          </span>
          <span className="metric-item">
            <MessageCircle className="meta-icon" />
            <span>{compactCount(post.comments_count)} комментариев</span>
          </span>
          <span className="metric-item">
            <Eye className="meta-icon" />
            <span>{compactCount(post.view_count)} просмотров</span>
          </span>
        </div>

        <div className="post-actions">
          <button
            type="button"
            className={`button button-inline ${post.is_liked ? "button-primary" : "button-muted"}`}
            onClick={() => void handleLike()}
            disabled={busy !== null}
          >
            <Heart className="button-icon" />
            <span>Лайк</span>
          </button>

          <button
            type="button"
            className={`button button-inline ${post.is_favorited ? "button-primary" : "button-muted"}`}
            onClick={() => void handleFavorite()}
            disabled={busy !== null}
          >
            <Bookmark className="button-icon" />
            <span>{post.is_favorited ? "В избранном" : "В избранное"}</span>
          </button>

          <Link href={`/posts/${post.id}`} className="button button-inline button-ghost">
            <ArrowUpRight className="button-icon" />
            <span>Открыть</span>
          </Link>
        </div>
      </footer>
    </article>
  );
}
