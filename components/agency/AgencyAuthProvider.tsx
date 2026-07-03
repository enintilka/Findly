"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { completeAccountSignup } from "@/lib/auth/complete-signup";
import { getAccountTypeFromUser } from "@/lib/auth/account-type";
import { createClient } from "@/lib/supabase";
import {
  fetchProfile,
  ensureAgencyProfile,
  mapAuthError,
  mapProfileUpdateError,
  profileToAgency,
  updateProfileRow,
} from "@/lib/auth/profile";
import type { Agency } from "@/types/agency";

type AuthResult =
  | { ok: true; agency: Agency }
  | { ok: true; emailConfirmationRequired: true }
  | { ok: false; error: string; rateLimited?: boolean };

interface AgencyAuthContextValue {
  agency: Agency | null;
  ready: boolean;
  signup: (input: {
    contactName: string;
    email: string;
    password: string;
  }) => Promise<AuthResult>;
  login: (email: string, password: string) => Promise<AuthResult>;
  updateProfile: (
    updates: Partial<Agency>,
  ) => Promise<Agency | { error: string } | null>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AgencyAuthContext = createContext<AgencyAuthContextValue | null>(null);

export function AgencyAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [agency, setAgency] = useState<Agency | null>(null);
  const [ready, setReady] = useState(false);

  const loadAgencyFromSession = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setAgency(null);
      return;
    }

    if (getAccountTypeFromUser(user) === "customer") {
      setAgency(null);
      return;
    }

    const profileResult = await fetchProfile(supabase, user.id);
    if (!profileResult.ok || profileResult.profile.role !== "agency") {
      setAgency(null);
      return;
    }

    setAgency(profileToAgency(profileResult.profile));
  }, []);

  const refresh = useCallback(async () => {
    await loadAgencyFromSession();
  }, [loadAgencyFromSession]);

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    async function init() {
      await loadAgencyFromSession();
      if (mounted) setReady(true);
    }

    void init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void loadAgencyFromSession();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadAgencyFromSession]);

  const signup = useCallback(
    async (input: {
      contactName: string;
      email: string;
      password: string;
    }): Promise<AuthResult> => {
      const result = await completeAccountSignup({
        email: input.email,
        password: input.password,
        fullName: input.contactName,
        accountType: "agency",
      });

      if (!result.ok) {
        return result;
      }

      if ("emailConfirmationRequired" in result) {
        return { ok: true, emailConfirmationRequired: true };
      }

      const mapped = profileToAgency(result.profile);
      setAgency(mapped);
      return { ok: true, agency: mapped };
    },
    [],
  );

  const login = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { ok: false, error: mapAuthError(error.message) };
      }

      if (!data.user) {
        return { ok: false, error: "Invalid email or password." };
      }

      const profileResult = await ensureAgencyProfile(supabase, data.user);
      if (!profileResult.ok || profileResult.profile.role !== "agency") {
        await supabase.auth.signOut();
        return {
          ok: false,
          error: profileResult.ok
            ? "Invalid email, password, or account type."
            : mapAuthError(profileResult.error),
        };
      }

      const mapped = profileToAgency(profileResult.profile);
      setAgency(mapped);
      return { ok: true, agency: mapped };
    },
    [],
  );

  const updateProfile = useCallback(
    async (
      updates: Partial<Agency>,
    ): Promise<Agency | { error: string } | null> => {
      if (!agency) return null;

      const supabase = createClient();
      const rowUpdates: {
        full_name?: string;
        phone?: string | null;
        avatar_url?: string | null;
        agency_name?: string | null;
        bio?: string | null;
        website?: string | null;
        office_address?: string | null;
      } = {};

      if (updates.contactName !== undefined) {
        rowUpdates.full_name = updates.contactName;
      }
      if (updates.phone !== undefined) {
        rowUpdates.phone = updates.phone || null;
      }
      if (updates.profilePicture !== undefined) {
        rowUpdates.avatar_url = updates.profilePicture || null;
      }
      if (updates.agencyName !== undefined) {
        rowUpdates.agency_name = updates.agencyName || null;
      }
      if (updates.description !== undefined) {
        rowUpdates.bio = updates.description || null;
      }
      if (updates.website !== undefined) {
        rowUpdates.website = updates.website || null;
      }
      if (updates.officeAddress !== undefined) {
        rowUpdates.office_address = updates.officeAddress || null;
      }

      const result = await updateProfileRow(supabase, agency.id, rowUpdates);
      if (!result.ok) {
        return { error: mapProfileUpdateError(result.error) };
      }

      const mapped = profileToAgency(result.profile);
      setAgency(mapped);
      return mapped;
    },
    [agency],
  );

  const logout = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
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
