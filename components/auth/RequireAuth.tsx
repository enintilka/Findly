"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";

export function RequireAuth({
  role,
  children,
}: {
  role?: "vendor" | "agency";
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, ready } = useAuth();

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace(role ? `/login/${role}` : "/");
      return;
    }
    if (role && user.role !== role) {
      router.replace(
        user.role === "vendor" ? "/dashboard/vendor" : "/dashboard/agency",
      );
    }
  }, [ready, user, role, router]);

  if (!ready || !user || (role && user.role !== role)) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

  return <>{children}</>;
}
