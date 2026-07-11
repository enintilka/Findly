"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCustomerAuth } from "@/components/customer/CustomerAuthProvider";
import { useAgencyAuth } from "@/components/agency/AgencyAuthProvider";
import { getUnreadCount } from "@/lib/agency-store";
import { AUTH_ROUTES } from "@/lib/auth-routes";

type NavTheme = "customer" | "agency" | "guest";

interface DashboardNavProps {
  theme: NavTheme;
  title?: string;
  subtitle?: string;
}

function MessagesIcon({ count }: { count: number }) {
  return (
    <span className="relative inline-flex">
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
        />
      </svg>
      {count > 0 ? (
        <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
          {count > 9 ? "9+" : count}
        </span>
      ) : null}
    </span>
  );
}

export default function DashboardNav({
  theme,
  title,
  subtitle,
}: DashboardNavProps) {
  const router = useRouter();
  const { customer, logout: logoutCustomer } = useCustomerAuth();
  const { agency, logout: logoutAgency } = useAgencyAuth();
  const [unread, setUnread] = useState(0);

  const isCustomer = theme === "customer" && customer;
  const isAgency = theme === "agency" && agency;
  const accent =
    theme === "agency"
      ? "text-violet-600 hover:text-violet-700"
      : "text-indigo-600 hover:text-indigo-700";
  const logoHref = isCustomer
    ? AUTH_ROUTES.customerDashboard
    : isAgency
      ? AUTH_ROUTES.agencyDashboard
      : "/";

  useEffect(() => {
    async function refresh() {
      if (isCustomer) {
        setUnread(await getUnreadCount(customer.id, "customer"));
      } else if (isAgency) {
        setUnread(await getUnreadCount(agency.id, "agency"));
      } else {
        setUnread(0);
      }
    }
    void refresh();
    window.addEventListener("findly-platform-change", refresh);
    return () => window.removeEventListener("findly-platform-change", refresh);
  }, [isCustomer, isAgency, customer, agency]);

  const messagesHref = isCustomer
    ? "/customer/chat"
    : isAgency
      ? "/agency/chat"
      : AUTH_ROUTES.chooseAccount;

  async function handleSignOut() {
    if (isCustomer) await logoutCustomer();
    if (isAgency) await logoutAgency();
    router.push(AUTH_ROUTES.home);
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href={logoHref} className={`text-xl font-bold ${accent}`}>
          Findly
        </Link>

        <nav className="flex items-center gap-1 sm:gap-4">
          {isCustomer ? (
            <>
              <Link
                href={AUTH_ROUTES.customerDashboard}
                className="hidden px-2 py-1 text-sm font-medium text-slate-600 hover:text-indigo-600 sm:inline"
              >
                Dashboard
              </Link>
              <Link
                href="/customer/profile/edit"
                className="hidden px-2 py-1 text-sm font-medium text-slate-600 hover:text-indigo-600 sm:inline"
              >
                Profile
              </Link>
              <Link
                href="/customer/requests/new"
                className="hidden px-2 py-1 text-sm font-medium text-slate-600 hover:text-indigo-600 sm:inline"
              >
                New request
              </Link>
              <Link
                href={messagesHref}
                aria-label={`Messages${unread ? `, ${unread} unread` : ""}`}
                className="relative px-2 py-1 text-slate-600 hover:text-indigo-600"
              >
                <MessagesIcon count={unread} />
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="px-2 py-1 text-sm font-medium text-slate-600 hover:text-indigo-600"
              >
                Sign out
              </button>
            </>
          ) : isAgency ? (
            <>
              <Link
                href={AUTH_ROUTES.agencyDashboard}
                className="hidden px-2 py-1 text-sm font-medium text-slate-600 hover:text-violet-600 sm:inline"
              >
                Dashboard
              </Link>
              <Link
                href="/agency/profile/edit"
                className="hidden px-2 py-1 text-sm font-medium text-slate-600 hover:text-violet-600 sm:inline"
              >
                Profile
              </Link>
              <Link
                href="/agency/listings/new"
                className="hidden px-2 py-1 text-sm font-medium text-slate-600 hover:text-violet-600 sm:inline"
              >
                Add property
              </Link>
              <Link
                href={messagesHref}
                aria-label={`Messages${unread ? `, ${unread} unread` : ""}`}
                className="relative px-2 py-1 text-slate-600 hover:text-violet-600"
              >
                <MessagesIcon count={unread} />
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="px-2 py-1 text-sm font-medium text-slate-600 hover:text-violet-600"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href={AUTH_ROUTES.chooseAccount}
                className="px-2 py-1 text-sm font-medium text-slate-600 hover:text-indigo-600"
              >
                Sign in
              </Link>
              <Link
                href={AUTH_ROUTES.register}
                className={`rounded-lg px-4 py-2 text-sm font-medium text-white ${
                  theme === "agency"
                    ? "bg-violet-600 hover:bg-violet-700"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>

      {title ? (
        <div className="border-t border-slate-100 bg-slate-50 px-4 py-8 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-2 text-slate-600">{subtitle}</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </header>
  );
}
