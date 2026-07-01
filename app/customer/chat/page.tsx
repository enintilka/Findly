"use client";

import Link from "next/link";
import { useCustomerAuth } from "@/components/customer/CustomerAuthProvider";
import CustomerHeader from "@/components/customer/CustomerHeader";
import ChatThreadList from "@/components/chat/ChatThreadList";
import { RequireCustomer } from "@/components/customer/RequireCustomer";

export default function CustomerChatPage() {
  const { customer } = useCustomerAuth();

  return (
    <>
      <CustomerHeader
        title="Messages"
        subtitle="Chat securely with agencies. Personal contact details stay private until you choose to share them."
      />
      <main className="bg-slate-50 px-4 py-10 sm:px-6">
        <RequireCustomer requireProfile>
          <div className="mx-auto max-w-3xl">
            {customer ? (
              <ChatThreadList
                role="customer"
                userId={customer.id}
                basePath="/customer/chat"
              />
            ) : null}
            <Link
              href="/customer/dashboard"
              className="mt-6 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              ← Back to dashboard
            </Link>
          </div>
        </RequireCustomer>
      </main>
    </>
  );
}
