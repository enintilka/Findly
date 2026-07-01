"use client";

import CustomerDashboardContent from "@/components/customer/CustomerDashboardContent";
import CustomerHeader from "@/components/customer/CustomerHeader";
import { RequireCustomer } from "@/components/customer/RequireCustomer";

export default function CustomerDashboardPage() {
  return (
    <>
      <CustomerHeader
        title="Your dashboard"
        subtitle="Manage your property requests and wait for agencies to reach out."
      />
      <main className="bg-slate-50 px-4 py-10 sm:px-6">
        <RequireCustomer requireProfile>
          <div className="mx-auto max-w-4xl">
            <CustomerDashboardContent />
          </div>
        </RequireCustomer>
      </main>
    </>
  );
}
