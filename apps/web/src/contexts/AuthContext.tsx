"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { apiFetch, apiJson, getApiBase } from "@/lib/api";
import type { User } from "@/types/api";

const ACCESS_KEY = "calync_access_token";
const REFRESH_KEY = "calync_refresh_token";

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, nextUrl?: string) => Promise<void>;
  register: (email: string, password: string, role: "ORGANIZER" | "ATTENDEE", nextUrl?: string) => Promise<void>;
  logout: () => void;
  getToken: () => string | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const getToken = useCallback(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(ACCESS_KEY);
  }, []);

  const setTokens = useCallback(
    (access: string, refresh: string) => {
      if (typeof window === "undefined") return;
      localStorage.setItem(ACCESS_KEY, access);
      localStorage.setItem(REFRESH_KEY, refresh);
    },
    []
  );

  const clearTokens = useCallback(() => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    setUser(null);
  }, []);

  const fetchUser = useCallback(async (token: string): Promise<boolean> => {
    try {
      const res = await apiFetch("/auth/me", { token });
      if (!res.ok) return false;
      const me = (await res.json()) as User;
      setUser(me);
      return true;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem(ACCESS_KEY) : null;
    if (!token) {
      setIsLoading(false);
      return;
    }
    fetchUser(token).then((ok) => {
      if (!ok) {
        const refreshToken = localStorage.getItem(REFRESH_KEY);
        if (refreshToken) {
          fetch(getApiBase() + "/auth/refresh", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
          })
            .then((r) => r.json())
            .then((data) => {
              if (data.accessToken && data.refreshToken) {
                setTokens(data.accessToken, data.refreshToken);
                return fetchUser(data.accessToken);
              }
              clearTokens();
            })
            .catch(clearTokens)
            .finally(() => setIsLoading(false));
          return;
        }
        clearTokens();
      }
      setIsLoading(false);
    });
  }, [fetchUser, setTokens, clearTokens]);

  const login = useCallback(
    async (email: string, password: string, nextUrl?: string) => {
      const data = await apiJson<{
        accessToken: string;
        refreshToken: string;
        user: User;
      }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setTokens(data.accessToken, data.refreshToken);
      setUser(data.user);
      const path = nextUrl && nextUrl.startsWith("/") ? nextUrl : "/orders";
      router.push(path);
    },
    [setTokens, router]
  );

  const register = useCallback(
    async (email: string, password: string, role: "ORGANIZER" | "ATTENDEE", nextUrl?: string) => {
      const data = await apiJson<{
        accessToken: string;
        refreshToken: string;
        user: User;
      }>("/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password, role }),
      });
      setTokens(data.accessToken, data.refreshToken);
      setUser(data.user);
      const path = nextUrl && nextUrl.startsWith("/") ? nextUrl : "/orders";
      router.push(path);
    },
    [setTokens, router]
  );

  const logout = useCallback(() => {
    const refreshToken = typeof window !== "undefined" ? localStorage.getItem(REFRESH_KEY) : null;
    if (refreshToken) {
      fetch(getApiBase() + "/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      }).catch(() => {});
    }
    clearTokens();
    router.push("/login");
  }, [clearTokens, router]);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, register, logout, getToken }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
