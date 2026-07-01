"use client";

import CustomerHeader from "@/components/customer/CustomerHeader";
import CustomerSignupForm from "@/components/customer/CustomerSignupForm";
import { RedirectIfCustomer } from "@/components/customer/RequireCustomer";

export default function CustomerSignupPage() {
  return (
    <RedirectIfCustomer>
      <CustomerHeader />
      <main className="bg-slate-50 px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
            Customer account
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Sign up to describe your ideal property and let agencies come to you.
          </p>
          <div className="mt-8">
            <CustomerSignupForm />
          </div>
        </div>
      </main>
    </RedirectIfCustomer>
  );
}
