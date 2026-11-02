"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { UserRead } from "@/api/connect.types";
import {
  clearSession,
  getStoredToken,
  getStoredUser,
  saveSession,
} from "@/lib/auth";

interface AuthContextValue {
  token: string | null;
  user: UserRead | null;
  isAuthenticated: boolean;
  hydrated: boolean;
  setSession: (token: string, user: UserRead | null) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserRead | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setToken(getStoredToken());
    setUser(getStoredUser<UserRead>());
    setHydrated(true);
  }, []);

  useEffect(() => {
    const onUnauthorized = () => {
      setToken(null);
      setUser(null);
    };
    window.addEventListener("rag:unauthorized", onUnauthorized);
    return () => window.removeEventListener("rag:unauthorized", onUnauthorized);
  }, []);

  const setSession = useCallback(
    (nextToken: string, nextUser: UserRead | null) => {
      saveSession(nextToken, nextUser ?? undefined);
      setToken(nextToken);
      setUser(nextUser);
    },
    [],
  );

  const signOut = useCallback(() => {
    clearSession();
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      isAuthenticated: !!token,
      hydrated,
      setSession,
      signOut,
    }),
    [token, user, hydrated, setSession, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
