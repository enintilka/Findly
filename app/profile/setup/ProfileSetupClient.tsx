"use client";

import { useSearchParams } from "next/navigation";
import { RequireAuth } from "@/components/auth/RequireAuth";
import Navbar from "@/components/Navbar";
import ProfileSetupForm from "@/components/profile/ProfileSetupForm";
import { Card } from "@/components/ui/primitives";

export default function ProfileSetupClient() {
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role");
  const role = roleParam === "agency" ? "agency" : "vendor";

  return (
    <>
      <Navbar />
      <main className="bg-gray-50 px-4 py-16">
        <RequireAuth role={role}>
          <Card className="mx-auto max-w-2xl">
            <h1 className="text-2xl font-bold text-gray-900">
              Complete your profile
            </h1>
            <p className="mt-2 text-gray-600">
              {role === "vendor"
                ? "Add your details so agencies know who they're contacting."
                : "Tell property owners about your agency before you reach out."}
            </p>
            <div className="mt-8">
              <ProfileSetupForm role={role} />
            </div>
          </Card>
        </RequireAuth>
      </main>
    </>
  );
}
