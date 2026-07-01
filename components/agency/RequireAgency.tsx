"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAgencyAuth } from "@/components/agency/AgencyAuthProvider";
import { AUTH_ROUTES } from "@/lib/auth-routes";

export function RequireAgency({
  children,
  requireProfile = false,
}: {
  children: React.ReactNode;
  requireProfile?: boolean;
}) {
  const router = useRouter();
  const { agency, ready } = useAgencyAuth();

  useEffect(() => {
    if (!ready) return;
    if (!agency) {
      router.replace(AUTH_ROUTES.chooseAccount);
      return;
    }
    if (requireProfile && !agency.profileComplete) {
      router.replace("/agency/profile");
    }
  }, [ready, agency, requireProfile, router]);

  if (!ready || !agency) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-slate-500">
        Loading...
      </div>
    );
  }

  if (requireProfile && !agency.profileComplete) return null;
  return <>{children}</>;
}

export function RedirectIfAgency({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { agency, ready } = useAgencyAuth();

  useEffect(() => {
    if (!ready || !agency) return;
    router.replace(
      agency.profileComplete ? AUTH_ROUTES.agencyDashboard : "/agency/profile",
    );
  }, [ready, agency, router]);

  if (!ready) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-slate-500">
        Loading...
      </div>
    );
  }

  if (agency) return null;
  return <>{children}</>;
}
