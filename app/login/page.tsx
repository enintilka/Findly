import Link from "next/link";
import Navbar from "@/components/marketing/Navbar";
import ChooseAccountType from "@/components/auth/ChooseAccountType";

export default function LoginPage() {
  return (
    <>
      <Navbar />
      <main className="bg-slate-50 px-4 py-16 sm:px-6 sm:py-24">
        <ChooseAccountType mode="login" />
        <p className="mx-auto mt-6 max-w-md text-center">
          <Link
            href="/"
            className="text-sm font-medium text-slate-500 hover:text-slate-700"
          >
            ← Back to homepage
          </Link>
        </p>
      </main>
    </>
  );
}
