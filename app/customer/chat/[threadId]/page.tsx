"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCustomerAuth } from "@/components/customer/CustomerAuthProvider";
import CustomerHeader from "@/components/customer/CustomerHeader";
import ChatThreadView from "@/components/chat/ChatThreadView";
import { RequireCustomer } from "@/components/customer/RequireCustomer";

export default function CustomerChatThreadPage() {
  const params = useParams<{ threadId: string }>();
  const { customer } = useCustomerAuth();

  return (
    <>
      <CustomerHeader title="Conversation" />
      <main className="bg-slate-50 px-4 py-10 sm:px-6">
        <RequireCustomer requireProfile>
          <div className="mx-auto max-w-4xl space-y-4">
            {customer ? (
              <ChatThreadView
                threadId={params.threadId}
                role="customer"
                userId={customer.id}
                userName={customer.name}
                listPath="/customer/chat"
              />
            ) : null}
            <Link
              href="/customer/chat"
              className="inline-block text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              ← All messages
            </Link>
          </div>
        </RequireCustomer>
      </main>
    </>
  );
}
