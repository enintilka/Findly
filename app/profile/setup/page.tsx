import { Suspense } from "react";
import ProfileSetupClient from "./ProfileSetupClient";

export default function ProfileSetupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center text-gray-500">
          Loading...
        </div>
      }
    >
      <ProfileSetupClient />
    </Suspense>
  );
}
