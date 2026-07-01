"use client";

import { RequireAuth } from "@/components/auth/RequireAuth";
import Navbar from "@/components/Navbar";
import AgencyListingForm from "@/components/listings/AgencyListingForm";
import { Card } from "@/components/ui/primitives";

export default function NewListingPage() {
  return (
    <>
      <Navbar />
      <main className="bg-gray-50 px-4 py-16">
        <RequireAuth role="agency">
          <Card className="mx-auto max-w-2xl">
            <h1 className="text-2xl font-bold text-gray-900">Add agency listing</h1>
            <p className="mt-2 text-gray-600">
              Showcase properties your agency represents on your profile.
            </p>
            <div className="mt-8">
              <AgencyListingForm />
            </div>
          </Card>
        </RequireAuth>
      </main>
    </>
  );
}
