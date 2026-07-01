import AuthForm from "@/components/auth/AuthForm";
import Navbar from "@/components/Navbar";

export default function VendorSignupPage() {
  return (
    <>
      <Navbar />
      <main className="bg-gray-50 px-4 py-16">
        <AuthForm mode="signup" role="vendor" />
      </main>
    </>
  );
}
