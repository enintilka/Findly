"use client";

import Link from "next/link";
import CustomerHeader from "@/components/customer/CustomerHeader";
import CustomerLoginForm from "@/components/customer/CustomerLoginForm";
import { RedirectIfCustomer } from "@/components/customer/RequireCustomer";
import { AUTH_ROUTES } from "@/lib/auth-routes";

export default function CustomerLoginPage() {
  return (
    <RedirectIfCustomer>
      <CustomerHeader />
      <main className="bg-slate-50 px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
            Customer account
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">Sign in</h1>
          <p className="mt-2 text-sm text-slate-600">
            Access your profile and property requests.
          </p>
          <div className="mt-8">
            <CustomerLoginForm />
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
    </RedirectIfCustomer>
  );
}
