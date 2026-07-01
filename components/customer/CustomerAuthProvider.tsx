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
  getCurrentCustomer,
  loginCustomer as storeLogin,
  logoutCustomer as storeLogout,
  signupCustomer as storeSignup,
  updateCustomerProfile as storeUpdateProfile,
} from "@/lib/customer-store";
import type { Customer } from "@/types/customer";

interface CustomerAuthContextValue {
  customer: Customer | null;
  ready: boolean;
  signup: (input: {
    name: string;
    email: string;
    password: string;
  }) => ReturnType<typeof storeSignup>;
  login: (
    email: string,
    password: string,
  ) => ReturnType<typeof storeLogin>;
  updateProfile: (updates: Partial<Customer>) => Customer | null;
  logout: () => void;
  refresh: () => void;
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

  const refresh = useCallback(() => {
    setCustomer(getCurrentCustomer());
  }, []);

  useEffect(() => {
    refresh();
    setReady(true);
    window.addEventListener("findly-customer-change", refresh);
    return () => window.removeEventListener("findly-customer-change", refresh);
  }, [refresh]);

  const signup = useCallback((input: Parameters<typeof storeSignup>[0]) => {
    const result = storeSignup(input);
    if (result.ok) setCustomer(result.customer);
    return result;
  }, []);

  const login = useCallback((email: string, password: string) => {
    const result = storeLogin(email, password);
    if (result.ok) setCustomer(result.customer);
    return result;
  }, []);

  const updateProfile = useCallback(
    (updates: Partial<Customer>) => {
      if (!customer) return null;
      const updated = storeUpdateProfile(customer.id, updates);
      if (updated) setCustomer(updated);
      return updated;
    },
    [customer],
  );

  const logout = useCallback(() => {
    storeLogout();
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
