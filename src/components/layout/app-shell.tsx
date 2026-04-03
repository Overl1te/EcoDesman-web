"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  Bell,
  CalendarDays,
  ChevronRight,
  LogIn,
  LogOut,
  MapPinned,
  MoonStar,
  Newspaper,
  Shield,
  SquarePen,
  SunMedium,
  UserRound,
} from "lucide-react";

import { useAuth } from "@/components/providers/auth-provider";
import { useThemeMode } from "@/components/providers/theme-provider";
import { Avatar } from "@/components/ui/avatar";
import { APP_NAME } from "@/lib/config";

const navItems: Array<{ href: string; label: string; icon: LucideIcon }> = [
  { href: "/", label: "Лента", icon: Newspaper },
  { href: "/events", label: "Мероприятия", icon: CalendarDays },
  { href: "/map", label: "Карта", icon: MapPinned },
];

export function AppShell({
  title,
  children,
  actions,
  contentClassName,
}: {
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  contentClassName?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();
  const { mode, toggleMode } = useThemeMode();
  const profileActive = pathname.startsWith("/profile") || pathname.startsWith("/favorites");
  const adminActive = pathname.startsWith("/admin");
  const canAccessAdmin = Boolean(user?.can_access_admin);
  const ThemeIcon = mode === "dark" ? MoonStar : SunMedium;
  const themeLabel = mode === "dark" ? "Тёмная" : "Светлая";
  const resolvedNavItems = canAccessAdmin
    ? [...navItems, { href: "/admin", label: "Админка", icon: Shield }]
    : navItems;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-logo">
            <Image src="/icon.png" alt={APP_NAME} width={52} height={52} />
          </div>
          <div>
            <p className="eyebrow">Экосообщество</p>
            <strong>{APP_NAME}</strong>
          </div>
        </div>

        <nav className="nav-list">
          {resolvedNavItems.map((item) => {
            const Icon = item.icon;
            const href = item.href === "/admin" ? "/admin/" : item.href;
            const isActive = item.href === "/admin" ? adminActive : pathname === item.href;

            return (
              <Link
                key={item.href}
                href={href}
                className={`nav-link ${isActive ? "is-active" : ""}`}
              >
                <Icon className="nav-icon" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {isAuthenticated ? (
            <Link href="/profile" className={`nav-link ${profileActive ? "is-active" : ""}`}>
              <UserRound className="nav-icon" />
              <span>Профиль</span>
            </Link>
          ) : null}
        </nav>
        <div className="sidebar-footer">
          {isAuthenticated && user ? (
            <>
              <Link href="/profile" className="profile-chip profile-chip-link">
                <div className="profile-chip-head">
                  <Avatar user={user} />
                  <div className="profile-chip-copy">
                    <strong>{user.name || user.username}</strong>
                    <p>@{user.username}</p>
                  </div>
                  <ChevronRight className="profile-chip-arrow" />
                </div>
                {user.status_text ? (
                  <span className="profile-chip-status">{user.status_text}</span>
                ) : null}
              </Link>
              
              <br />

              <div className="sidebar-actions">
                <Link href="/posts/new" className="button button-primary">
                  <SquarePen className="button-icon" />
                  <span>Новый пост</span>
                </Link>
                <Link href="/notifications" className="button button-muted">
                  <Bell className="button-icon" />
                  <span>Уведомления</span>
                </Link>
                <button
                  type="button"
                  className="button button-ghost"
                  onClick={async () => {
                    await logout();
                    router.push("/");
                  }}
                >
                  <LogOut className="button-icon" />
                  <span>Выйти</span>
                </button>
              </div>
            </>
          ) : (
            <div className="guest-card">
              <h3>Войти в сообщество</h3>
              <p>Публикации, избранное, комментарии и ваш профиль будут доступны после входа.</p>
              <div className="sidebar-actions">
                <button
                  type="button"
                  className="button button-primary"
                  onClick={() => openAuthModal({ returnTo: pathname || "/" })}
                >
                  <LogIn className="button-icon" />
                  <span>Войти</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      <div className="shell-content">
        <header className="topbar">
          <div className="topbar-heading">
            <h1>{title}</h1>
          </div>
          <div className="topbar-actions">
            {actions}
            <button type="button" className="button button-muted" onClick={toggleMode}>
              <ThemeIcon className="button-icon" />
              <span>{themeLabel}</span>
            </button>
          </div>
        </header>

        <main className={`page-content${contentClassName ? ` ${contentClassName}` : ""}`}>
          {children}
        </main>
      </div>

      <nav
        className="mobile-nav"
        style={{ gridTemplateColumns: `repeat(${resolvedNavItems.length + 1}, 1fr)` }}
      >
        {resolvedNavItems.map((item) => {
          const Icon = item.icon;
          const href = item.href === "/admin" ? "/admin/" : item.href;
          const isActive = item.href === "/admin" ? adminActive : pathname === item.href;

          return (
            <Link
              key={item.href}
              href={href}
              className={`mobile-nav-link ${isActive ? "is-active" : ""}`}
            >
              <Icon className="nav-icon" />
              <span>{item.label}</span>
            </Link>
          );
        })}

        {isAuthenticated ? (
          <Link href="/profile" className={`mobile-nav-link ${profileActive ? "is-active" : ""}`}>
            <UserRound className="nav-icon" />
            <span>Профиль</span>
          </Link>
        ) : (
          <button
            type="button"
            className="mobile-nav-link mobile-nav-button"
            onClick={() => openAuthModal({ returnTo: pathname || "/" })}
          >
            <LogIn className="nav-icon" />
            <span>Войти</span>
          </button>
        )}
      </nav>
    </div>
  );
}
