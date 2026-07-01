import { redirect } from "next/navigation";
import { AUTH_ROUTES } from "@/lib/auth-routes";

export default function LegacyVendorLoginPage() {
  redirect(AUTH_ROUTES.chooseAccount);
}
