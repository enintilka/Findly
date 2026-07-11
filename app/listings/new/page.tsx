import { redirect } from "next/navigation";

export default function LegacyNewListingPage() {
  redirect("/agency/listings/new");
}
