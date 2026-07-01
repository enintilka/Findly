"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCustomerAuth } from "@/components/customer/CustomerAuthProvider";
import { AUTH_ROUTES } from "@/lib/auth-routes";

export function RequireCustomer({
  children,
  requireProfile = false,
}: {
  children: React.ReactNode;
  requireProfile?: boolean;
}) {
  const router = useRouter();
  const { customer, ready } = useCustomerAuth();

  useEffect(() => {
    if (!ready) return;
    if (!customer) {
      router.replace(AUTH_ROUTES.chooseAccount);
      return;
    }
    if (requireProfile && !customer.profileComplete) {
      router.replace("/customer/profile");
    }
  }, [ready, customer, requireProfile, router]);

  if (!ready || !customer) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-slate-500">
        Loading...
      </div>
    );
  }

  if (requireProfile && !customer.profileComplete) {
    return null;
  }

  return <>{children}</>;
}

export function RedirectIfCustomer({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { customer, ready } = useCustomerAuth();

  useEffect(() => {
    if (!ready || !customer) return;
    router.replace(
      customer.profileComplete
        ? AUTH_ROUTES.customerDashboard
        : "/customer/profile",
    );
  }, [ready, customer, router]);

  if (!ready) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-slate-500">
        Loading...
      </div>
    );
  }

  if (customer) return null;
  return <>{children}</>;
}
