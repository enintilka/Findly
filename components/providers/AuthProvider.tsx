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
  getCurrentUser,
  login as storeLogin,
  setSessionUserId,
  signup as storeSignup,
  updateProfile as storeUpdateProfile,
} from "@/lib/store";
import type { User, UserRole } from "@/types";

interface AuthContextValue {
  user: User | null;
  ready: boolean;
  login: (
    email: string,
    password: string,
    role: UserRole,
  ) => { ok: true; user: User } | { ok: false; error: string };
  signup: (input: {
    email: string;
    password: string;
    role: UserRole;
    name: string;
  }) => { ok: true; user: User } | { ok: false; error: string };
  updateProfile: (updates: Partial<User>) => User | null;
  logout: () => void;
  refresh: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(() => {
    setUser(getCurrentUser());
  }, []);

  useEffect(() => {
    refresh();
    setReady(true);

    const onSessionChange = () => refresh();
    const onDataChange = () => refresh();

    window.addEventListener("findly-session-change", onSessionChange);
    window.addEventListener("findly-data-change", onDataChange);
    return () => {
      window.removeEventListener("findly-session-change", onSessionChange);
      window.removeEventListener("findly-data-change", onDataChange);
    };
  }, [refresh]);

  const login = useCallback(
    (email: string, password: string, role: UserRole) => {
      const result = storeLogin(email, password, role);
      if (result.ok) setUser(result.user);
      return result;
    },
    [],
  );

  const signup = useCallback(
    (input: {
      email: string;
      password: string;
      role: UserRole;
      name: string;
    }) => {
      const result = storeSignup(input);
      if (result.ok) setUser(result.user);
      return result;
    },
    [],
  );

  const updateProfile = useCallback(
    (updates: Partial<User>) => {
      if (!user) return null;
      const updated = storeUpdateProfile(user.id, updates);
      if (updated) setUser(updated);
      return updated;
    },
    [user],
  );

  const logout = useCallback(() => {
    setSessionUserId(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, ready, login, signup, updateProfile, logout, refresh }),
    [user, ready, login, signup, updateProfile, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
