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
  getCurrentAgency,
  loginAgency as storeLogin,
  logoutAgency as storeLogout,
  setAgencySessionId,
  signupAgency as storeSignup,
  updateAgencyProfile as storeUpdateProfile,
} from "@/lib/agency-store";
import type { Agency } from "@/types/agency";

interface AgencyAuthContextValue {
  agency: Agency | null;
  ready: boolean;
  signup: (input: {
    contactName: string;
    email: string;
    password: string;
  }) => ReturnType<typeof storeSignup>;
  login: (
    email: string,
    password: string,
  ) => ReturnType<typeof storeLogin>;
  updateProfile: (updates: Partial<Agency>) => Agency | null;
  logout: () => void;
  refresh: () => void;
}

const AgencyAuthContext = createContext<AgencyAuthContextValue | null>(null);

export function AgencyAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [agency, setAgency] = useState<Agency | null>(null);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(() => {
    setAgency(getCurrentAgency());
  }, []);

  useEffect(() => {
    refresh();
    setReady(true);
    window.addEventListener("findly-platform-change", refresh);
    return () => window.removeEventListener("findly-platform-change", refresh);
  }, [refresh]);

  const signup = useCallback((input: Parameters<typeof storeSignup>[0]) => {
    const result = storeSignup(input);
    if (result.ok) setAgency(result.agency);
    return result;
  }, []);

  const login = useCallback((email: string, password: string) => {
    const result = storeLogin(email, password);
    if (result.ok) setAgency(result.agency);
    return result;
  }, []);

  const updateProfile = useCallback(
    (updates: Partial<Agency>) => {
      if (!agency) return null;
      const updated = storeUpdateProfile(agency.id, updates);
      if (updated) setAgency(updated);
      return updated;
    },
    [agency],
  );

  const logout = useCallback(() => {
    storeLogout();
    setAgency(null);
  }, []);

  const value = useMemo(
    () => ({ agency, ready, signup, login, updateProfile, logout, refresh }),
    [agency, ready, signup, login, updateProfile, logout, refresh],
  );

  return (
    <AgencyAuthContext.Provider value={value}>
      {children}
    </AgencyAuthContext.Provider>
  );
}

export function useAgencyAuth() {
  const context = useContext(AgencyAuthContext);
  if (!context) {
    throw new Error("useAgencyAuth must be used within AgencyAuthProvider");
  }
  return context;
}
