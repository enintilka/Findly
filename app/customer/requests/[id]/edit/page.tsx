"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCustomerAuth } from "@/components/customer/CustomerAuthProvider";
import CustomerHeader from "@/components/customer/CustomerHeader";
import CustomerRequestForm from "@/components/customer/CustomerRequestForm";
import { RequireCustomer } from "@/components/customer/RequireCustomer";
import { getCustomerRequestById } from "@/lib/customer-store";
import { getRequestImages } from "@/lib/request-images";
import type { CustomerRequest } from "@/types/customer";

function EditRequestContent() {
  const params = useParams<{ id: string }>();
  const { customer } = useCustomerAuth();
  const [request, setRequest] = useState<CustomerRequest | null | undefined>(
    undefined,
  );

  useEffect(() => {
    if (!customer) return;

    const refresh = async () => {
      const entry = await getCustomerRequestById(params.id);
      if (!entry || entry.customerId !== customer.id) {
        setRequest(null);
        return;
      }

      setRequest({
        ...entry,
        images: getRequestImages(entry),
      });
    };

    void refresh();
    window.addEventListener("findly-platform-change", refresh);
    window.addEventListener("findly-customer-change", refresh);
    return () => {
      window.removeEventListener("findly-platform-change", refresh);
      window.removeEventListener("findly-customer-change", refresh);
    };
  }, [customer, params.id]);

  if (request === undefined) {
    return null;
  }

  if (!request) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-600">
        Request not found.
        <Link
          href="/customer/dashboard"
          className="mt-4 block text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          ← Back to dashboard
        </Link>
      </div>
    );
  }

  return <CustomerRequestForm request={request} />;
}

export default function EditCustomerRequestPage() {
  return (
    <>
      <CustomerHeader
        title="Edit property request"
        subtitle="Update anything that is wrong or has changed."
      />
      <main className="bg-slate-50 px-4 py-10 sm:px-6">
        <RequireCustomer requireProfile>
          <div className="mx-auto max-w-3xl">
            <EditRequestContent />
          </div>
        </RequireCustomer>
      </main>
    </>
  );
}
