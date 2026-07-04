import Navbar from "@/components/marketing/Navbar";
import Hero from "@/components/marketing/Hero";
import HowItWorks from "@/components/marketing/HowItWorks";
import WorkflowCards from "@/components/marketing/WorkflowCards";
import Benefits from "@/components/marketing/Benefits";
import CallToAction from "@/components/marketing/CallToAction";
import Footer from "@/components/marketing/Footer";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    error_code?: string;
    error_description?: string;
    reset?: string;
  }>;
}) {
  const params = await searchParams;
  const passwordResetSuccess = params.reset === "1";
  const authNotice = passwordResetSuccess
    ? "Password updated successfully. Sign in to continue."
    : params.error_code === "otp_expired"
      ? "Your email confirmation link has expired. Sign up again or sign in if you already confirmed your account."
      : params.error
        ? decodeURIComponent(
            (params.error_description ?? params.error).replace(/\+/g, " "),
          )
        : null;

  return (
    <>
      <Navbar />
      {authNotice ? (
        <div
          className={`border-b px-4 py-3 text-center text-sm ${
            passwordResetSuccess
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-amber-200 bg-amber-50 text-amber-900"
          }`}
        >
          {authNotice}
        </div>
      ) : null}
      <main>
        <Hero />
        <HowItWorks />
        <WorkflowCards />
        <Benefits />
        <CallToAction />
      </main>
      <Footer />
    </>
  );
}
