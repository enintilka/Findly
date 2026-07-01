"use client";

import CustomerHeader from "@/components/customer/CustomerHeader";
import CustomerProfileForm from "@/components/customer/CustomerProfileForm";
import { RequireCustomer } from "@/components/customer/RequireCustomer";

export default function CustomerProfileEditPage() {
  return (
    <>
      <CustomerHeader
        title="Edit profile"
        subtitle="Update your photo and personal information."
      />
      <main className="bg-slate-50 px-4 py-10 sm:px-6">
        <RequireCustomer requireProfile>
          <div className="mx-auto max-w-3xl">
            <CustomerProfileForm mode="edit" />
          </div>
        </RequireCustomer>
      </main>
    </>
  );
}
