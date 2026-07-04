import Link from "next/link";
import CustomerHeader from "@/components/customer/CustomerHeader";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import { AUTH_ROUTES } from "@/lib/auth-routes";

export default function CustomerForgotPasswordPage() {
  return (
    <>
      <CustomerHeader />
      <main className="bg-slate-50 px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
            Customer account
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">
            Forgot password
          </h1>
          <div className="mt-8">
            <ForgotPasswordForm
              accountLabel="customer"
              loginHref={AUTH_ROUTES.customerLogin}
              accentClassName="bg-indigo-600 hover:bg-indigo-700"
            />
          </div>
          <p className="mt-6 text-center">
            <Link
              href={AUTH_ROUTES.chooseAccount}
              className="text-sm font-medium text-slate-500 hover:text-indigo-600"
            >
              ← Choose a different account type
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
