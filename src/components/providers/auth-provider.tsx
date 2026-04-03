"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  changePassword,
  fetchMe,
  login as apiLogin,
  logout as apiLogout,
  register as apiRegister,
  updateProfile as apiUpdateProfile,
} from "@/lib/api";
import { clearStoredSession, readStoredSession, writeStoredSession } from "@/lib/session";
import type { AuthSession, CurrentUser, ProfileUpdatePayload } from "@/lib/types";

type AuthModalMode = "login" | "register";

interface AuthModalState {
  isOpen: boolean;
  mode: AuthModalMode;
  returnTo: string;
}

interface AuthContextValue {
  user: CurrentUser | null;
  session: AuthSession | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  authModal: AuthModalState;
  login: (payload: { identifier: string; password: string }) => Promise<void>;
  register: (payload: {
    username: string;
    email: string;
    display_name?: string;
    phone?: string;
    password: string;
    password_confirmation: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (payload: ProfileUpdatePayload) => Promise<CurrentUser>;
  changePassword: (payload: {
    current_password: string;
    new_password: string;
    new_password_confirmation: string;
  }) => Promise<void>;
  openAuthModal: (options?: { mode?: AuthModalMode; returnTo?: string }) => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [authModal, setAuthModal] = useState<AuthModalState>({
    isOpen: false,
    mode: "login",
    returnTo: "/",
  });

  useEffect(() => {
    const bootstrap = async () => {
      const stored = readStoredSession();
      if (!stored) {
        setIsBootstrapping(false);
        return;
      }

      try {
        const user = await fetchMe(stored.access);
        const nextSession = { ...stored, user };
        writeStoredSession(nextSession);
        setSession(nextSession);
      } catch {
        clearStoredSession();
        setSession(null);
      } finally {
        setIsBootstrapping(false);
      }
    };

    void bootstrap();
  }, []);

  const login = useCallback(async (payload: { identifier: string; password: string }) => {
    const nextSession = await apiLogin(payload);
    setSession(nextSession);
  }, []);

  const register = useCallback(
    async (payload: {
      username: string;
      email: string;
      display_name?: string;
      phone?: string;
      password: string;
      password_confirmation: string;
    }) => {
      const nextSession = await apiRegister(payload);
      setSession(nextSession);
    },
    [],
  );

  const logout = useCallback(async () => {
    await apiLogout();
    setSession(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const stored = readStoredSession();
    if (!stored) {
      setSession(null);
      return;
    }

    const user = await fetchMe(stored.access);
    const nextSession = { ...stored, user };
    writeStoredSession(nextSession);
    setSession(nextSession);
  }, []);

  const updateProfile = useCallback(async (payload: ProfileUpdatePayload) => {
    const user = await apiUpdateProfile(payload);
    const stored = readStoredSession();
    if (stored) {
      const nextSession = { ...stored, user };
      writeStoredSession(nextSession);
      setSession(nextSession);
    }
    return user;
  }, []);

  const changePasswordHandler = useCallback(
    async (payload: {
      current_password: string;
      new_password: string;
      new_password_confirmation: string;
    }) => {
      const nextSession = await changePassword(payload);
      setSession(nextSession);
    },
    [],
  );

  const openAuthModal = useCallback((options?: { mode?: AuthModalMode; returnTo?: string }) => {
    setAuthModal({
      isOpen: true,
      mode: options?.mode ?? "login",
      returnTo: options?.returnTo ?? "/",
    });
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModal((current) => ({ ...current, isOpen: false }));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      isAuthenticated: Boolean(session?.access),
      isBootstrapping,
      authModal,
      login,
      register,
      logout,
      refreshUser,
      updateProfile,
      changePassword: changePasswordHandler,
      openAuthModal,
      closeAuthModal,
    }),
    [
      authModal,
      changePasswordHandler,
      closeAuthModal,
      isBootstrapping,
      login,
      logout,
      openAuthModal,
      refreshUser,
      register,
      session,
      updateProfile,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
