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
import { createClient } from "@/lib/supabase";
import {
  fetchProfile,
  ensureCustomerProfile,
  mapAuthError,
  mapProfileUpdateError,
  profileToCustomer,
  updateProfileRow,
} from "@/lib/auth/profile";
import type { Customer } from "@/types/customer";

type AuthResult =
  | { ok: true; customer: Customer }
  | { ok: true; emailConfirmationRequired: true }
  | { ok: false; error: string; rateLimited?: boolean };

interface CustomerAuthContextValue {
  customer: Customer | null;
  ready: boolean;
  signup: (input: {
    name: string;
    email: string;
    password: string;
  }) => Promise<AuthResult>;
  login: (email: string, password: string) => Promise<AuthResult>;
  updateProfile: (updates: Partial<Customer>) => Promise<Customer | null>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const CustomerAuthContext = createContext<CustomerAuthContextValue | null>(
  null,
);

export function CustomerAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [ready, setReady] = useState(false);

  const loadCustomerFromSession = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setCustomer(null);
      return;
    }

    const profileResult = await fetchProfile(supabase, user.id);
    if (profileResult.ok && profileResult.profile.role === "customer") {
      setCustomer(profileToCustomer(profileResult.profile));
      return;
    }

    setCustomer(null);
  }, []);

  const refresh = useCallback(async () => {
    await loadCustomerFromSession();
  }, [loadCustomerFromSession]);

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    async function init() {
      await loadCustomerFromSession();
      if (mounted) setReady(true);
    }

    void init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void loadCustomerFromSession();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadCustomerFromSession]);

  const signup = useCallback(
    async (input: {
      name: string;
      email: string;
      password: string;
    }): Promise<AuthResult> => {
      const result = await completeAccountSignup({
        email: input.email,
        password: input.password,
        fullName: input.name,
        accountType: "customer",
      });

      if (!result.ok) {
        return result;
      }

      if ("emailConfirmationRequired" in result) {
        return { ok: true, emailConfirmationRequired: true };
      }

      const mapped = profileToCustomer(result.profile);
      setCustomer(mapped);
      return { ok: true, customer: mapped };
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

      const profileResult = await ensureCustomerProfile(supabase, data.user);
      if (!profileResult.ok || profileResult.profile.role !== "customer") {
        await supabase.auth.signOut();
        return {
          ok: false,
          error: profileResult.ok
            ? "Invalid email, password, or account type."
            : mapAuthError(profileResult.error),
        };
      }

      const mapped = profileToCustomer(profileResult.profile);
      setCustomer(mapped);
      return { ok: true, customer: mapped };
    },
    [],
  );

  const updateProfile = useCallback(
    async (updates: Partial<Customer>): Promise<Customer | null> => {
      if (!customer) return null;

      const supabase = createClient();
      const rowUpdates: {
        full_name?: string;
        phone?: string | null;
        avatar_url?: string | null;
        country?: string | null;
        city?: string | null;
        bio?: string | null;
      } = {};

      if (updates.name !== undefined) {
        rowUpdates.full_name = updates.name;
      }
      if (updates.phone !== undefined) {
        rowUpdates.phone = updates.phone || null;
      }
      if (updates.profilePicture !== undefined) {
        rowUpdates.avatar_url = updates.profilePicture || null;
      }
      if (updates.country !== undefined) {
        rowUpdates.country = updates.country || null;
      }
      if (updates.city !== undefined) {
        rowUpdates.city = updates.city || null;
      }
      if (updates.bio !== undefined) {
        rowUpdates.bio = updates.bio || null;
      }

      const result = await updateProfileRow(supabase, customer.id, rowUpdates);
      if (!result.ok) {
        console.error(mapProfileUpdateError(result.error));
        return null;
      }

      const mapped = profileToCustomer(result.profile);
      setCustomer(mapped);
      return mapped;
    },
    [customer],
  );

  const logout = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setCustomer(null);
  }, []);

  const value = useMemo(
    () => ({ customer, ready, signup, login, updateProfile, logout, refresh }),
    [customer, ready, signup, login, updateProfile, logout, refresh],
  );

  return (
    <CustomerAuthContext.Provider value={value}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error("useCustomerAuth must be used within CustomerAuthProvider");
  }
  return context;
}
