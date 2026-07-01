"use client";

import { RequireAuth } from "@/components/auth/RequireAuth";
import Navbar from "@/components/Navbar";
import RequestForm from "@/components/requests/RequestForm";
import { Card } from "@/components/ui/primitives";

export default function NewRequestPage() {
  return (
    <>
      <Navbar />
      <main className="bg-gray-50 px-4 py-16">
        <RequireAuth role="vendor">
          <Card className="mx-auto max-w-2xl">
            <h1 className="text-2xl font-bold text-gray-900">
              Post a property request
            </h1>
            <p className="mt-2 text-gray-600">
              Upload your property details. Agencies will see it on the main
              page and can contact you through chat.
            </p>
            <div className="mt-8">
              <RequestForm />
            </div>
          </Card>
        </RequireAuth>
      </main>
    </>
  );
}
