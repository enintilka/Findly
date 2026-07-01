"use client";

import CustomerHeader from "@/components/customer/CustomerHeader";
import CustomerRequestForm from "@/components/customer/CustomerRequestForm";
import { RequireCustomer } from "@/components/customer/RequireCustomer";

export default function NewCustomerRequestPage() {
  return (
    <>
      <CustomerHeader
        title="Create a property request"
        subtitle="Describe exactly what you're looking for. Agencies will browse requests like yours."
      />
      <main className="bg-slate-50 px-4 py-10 sm:px-6">
        <RequireCustomer requireProfile>
          <div className="mx-auto max-w-3xl">
            <CustomerRequestForm />
          </div>
        </RequireCustomer>
      </main>
    </>
  );
}
