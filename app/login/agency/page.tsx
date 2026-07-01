import { redirect } from "next/navigation";
import { AUTH_ROUTES } from "@/lib/auth-routes";

export default function LegacyAgencyLoginPage() {
  redirect(AUTH_ROUTES.chooseAccount);
}
