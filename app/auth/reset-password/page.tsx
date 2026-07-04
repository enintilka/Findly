import { redirect } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import Navbar from "@/components/marketing/Navbar";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import { AUTH_ROUTES } from "@/lib/auth-routes";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; error?: string }>;
}) {
  const params = await searchParams;

  if (params.code) {
    redirect(
      `/auth/callback?code=${encodeURIComponent(params.code)}&next=${encodeURIComponent("/auth/reset-password")}`,
    );
  }

  const initialError =
    params.error === "invalid_link"
      ? "This reset link is invalid or has expired. Request a new reset link below."
      : params.error
        ? decodeURIComponent(params.error)
        : undefined;

  return (
    <>
      <Navbar />
      <main className="bg-slate-50 px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Set a new password</h1>
          <p className="mt-2 text-sm text-slate-600">
            Choose a new password for your Findly account.
          </p>
          <div className="mt-8">
            <Suspense
              fallback={
                <p className="text-center text-sm text-slate-500">
                  Verifying reset link...
                </p>
              }
            >
              <ResetPasswordForm initialError={initialError} />
            </Suspense>
          </div>
          <p className="mt-6 text-center">
            <Link
              href={AUTH_ROUTES.chooseAccount}
              className="text-sm font-medium text-slate-500 hover:text-indigo-600"
            >
              ← Back to sign in
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
