"use client";

import { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  Button,
  Input,
  Label,
  Select,
  Textarea,
} from "@/components/ui/primitives";
import { createRequest } from "@/lib/store";
import type { PropertyRequest } from "@/types";

export default function RequestForm() {
  const router = useRouter();
  const { user } = useAuth();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || user.role !== "vendor") return;

    const form = new FormData(event.currentTarget);
    createRequest(user, {
      title: String(form.get("title")),
      description: String(form.get("description")),
      city: String(form.get("city")),
      propertyType: String(
        form.get("propertyType"),
      ) as PropertyRequest["propertyType"],
      price: Number(form.get("price")),
      bedrooms: Number(form.get("bedrooms")) || undefined,
      area: Number(form.get("area")) || undefined,
    });

    router.push("/dashboard/vendor");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <Label htmlFor="title">Property title</Label>
        <Input id="title" name="title" required placeholder="3-room apartment in Old Town" />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          required
          rows={4}
          placeholder="Tell agencies about the property, condition, and timeline."
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="city">City</Label>
          <Input id="city" name="city" required placeholder="Bratislava" />
        </div>
        <div>
          <Label htmlFor="propertyType">Property type</Label>
          <Select id="propertyType" name="propertyType" required defaultValue="apartment">
            <option value="apartment">Apartment</option>
            <option value="house">House</option>
            <option value="land">Land</option>
            <option value="commercial">Commercial</option>
          </Select>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <Label htmlFor="price">Asking price (EUR)</Label>
          <Input id="price" name="price" type="number" required min={0} />
        </div>
        <div>
          <Label htmlFor="bedrooms">Bedrooms</Label>
          <Input id="bedrooms" name="bedrooms" type="number" min={0} />
        </div>
        <div>
          <Label htmlFor="area">Area (m²)</Label>
          <Input id="area" name="area" type="number" min={0} />
        </div>
      </div>

      <Button type="submit" className="w-full sm:w-auto">
        Publish request
      </Button>
    </form>
  );
}
