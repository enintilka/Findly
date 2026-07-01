"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import Navbar from "@/components/Navbar";
import RequestCard from "@/components/requests/RequestCard";
import { Card, LinkButton } from "@/components/ui/primitives";
import ChatInbox from "@/components/chat/ChatInbox";
import { getRequestsByVendor } from "@/lib/store";
import { useAuth } from "@/components/providers/AuthProvider";
import type { PropertyRequest } from "@/types";

function VendorDashboardContent() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<PropertyRequest[]>([]);

  useEffect(() => {
    if (!user) return;
    const refresh = () => setRequests(getRequestsByVendor(user.id));
    refresh();
    window.addEventListener("findly-data-change", refresh);
    return () => window.removeEventListener("findly-data-change", refresh);
  }, [user]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Owner dashboard</h1>
          <p className="mt-2 text-gray-600">
            Welcome back, {user?.name}. Post your request and wait for agencies
            to reach out.
          </p>
        </div>
        <LinkButton href="/requests/new">Post new request</LinkButton>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[2fr_1fr]">
        <section>
          <h2 className="text-xl font-semibold text-gray-900">Your requests</h2>
          {requests.length === 0 ? (
            <Card className="mt-4">
              <p className="font-medium text-gray-900">No requests yet</p>
              <p className="mt-2 text-sm text-gray-600">
                Upload your first property request to get started.
              </p>
              <Link
                href="/requests/new"
                className="mt-4 inline-block text-sm font-medium text-blue-600"
              >
                Create request
              </Link>
            </Card>
          ) : (
            <div className="mt-4 grid gap-4">
              {requests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">Messages</h2>
          <div className="mt-4">
            <ChatInbox />
          </div>
        </section>
      </div>
    </div>
  );
}

export default function VendorDashboardPage() {
  return (
    <>
      <Navbar />
      <main className="bg-gray-50">
        <RequireAuth role="vendor">
          <VendorDashboardContent />
        </RequireAuth>
      </main>
    </>
  );
}
