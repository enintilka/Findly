"use client";

import Link from "next/link";
import { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAgencyAuth } from "@/components/agency/AgencyAuthProvider";
import { FieldGroup, FormSection } from "@/components/customer/FormSection";
import { createAgencyListing } from "@/lib/agency-store";
import { Button, Input, Label, Textarea } from "@/components/ui/primitives";

export default function AgencyListingForm() {
  const router = useRouter();
  const { agency } = useAgencyAuth();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!agency) return;

    const form = new FormData(event.currentTarget);
    createAgencyListing(agency, {
      title: String(form.get("title")),
      description: String(form.get("description")),
      city: String(form.get("city")),
      country: String(form.get("country")),
      price: Number(form.get("price")),
    });

    router.push("/agency/dashboard");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormSection
        title="Add a property"
        description="Optional — upload listings your agency represents so you can match them to customer requests."
      >
        <div className="space-y-5">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" required />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" required rows={4} />
          </div>
          <FieldGroup columns={3}>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input id="country" name="country" required />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" required />
            </div>
            <div>
              <Label htmlFor="price">Price (€)</Label>
              <Input id="price" name="price" type="number" required min={0} />
            </div>
          </FieldGroup>
        </div>
      </FormSection>

      <Button type="submit" className="bg-violet-600 hover:bg-violet-700">
        Add property
      </Button>
    </form>
  );
}
