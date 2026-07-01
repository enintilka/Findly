"use client";

import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { LinkButton } from "@/components/ui/primitives";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-2xl font-bold tracking-tight text-blue-600 transition hover:text-blue-700"
        >
          Findly
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/browse"
            className="hidden text-sm font-medium text-gray-600 transition hover:text-blue-600 sm:inline"
          >
            Browse requests
          </Link>

          {user ? (
            <>
              <Link
                href={
                  user.role === "vendor"
                    ? "/dashboard/vendor"
                    : "/dashboard/agency"
                }
                className="text-sm font-medium text-gray-600 transition hover:text-blue-600"
              >
                Dashboard
              </Link>
              <Link
                href="/chat"
                className="text-sm font-medium text-gray-600 transition hover:text-blue-600"
              >
                Messages
              </Link>
              <button
                type="button"
                onClick={logout}
                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <LinkButton href="/login/vendor" variant="ghost" className="hidden sm:inline-flex">
                Owner login
              </LinkButton>
              <LinkButton href="/login/agency" variant="ghost" className="hidden sm:inline-flex">
                Agency login
              </LinkButton>
              <LinkButton href="/signup/vendor" variant="secondary">
                Get started
              </LinkButton>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
