"use client";

import CustomerHeader from "@/components/customer/CustomerHeader";
import CustomerProfileForm from "@/components/customer/CustomerProfileForm";
import { RequireCustomer } from "@/components/customer/RequireCustomer";

export default function CustomerProfilePage() {
  return (
    <>
      <CustomerHeader
        title="Complete your profile"
        subtitle="A few details help agencies understand who they're helping."
      />
      <main className="bg-slate-50 px-4 py-10 sm:px-6">
        <RequireCustomer>
          <div className="mx-auto max-w-3xl">
            <CustomerProfileForm />
          </div>
        </RequireCustomer>
      </main>
    </>
  );
}
