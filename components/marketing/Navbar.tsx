"use client";

import Link from "next/link";
import { useState } from "react";

const navLinks = [
  { label: "How it works", href: "#how-it-works" },
  { label: "For customers", href: "#workflows" },
  { label: "For agencies", href: "#workflows" },
  { label: "Benefits", href: "#benefits" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-2xl font-bold tracking-tight text-indigo-600 transition hover:text-indigo-700"
        >
          Findly
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-slate-600 transition hover:text-indigo-600"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/register"
            className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Register
          </Link>
          <Link
            href="/login"
            className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Sign in
          </Link>
          <Link
            href="/customer/signup"
            className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700"
          >
            Find a property
          </Link>
          <Link
            href="/agency/signup"
            className="rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-violet-700"
          >
            Join as agency
          </Link>
        </div>

        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="inline-flex rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 md:hidden"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18 18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {open ? (
        <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                {link.label}
              </a>
            ))}
            <hr className="my-2 border-slate-200" />
            <Link
              href="/register"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700"
            >
              Register
            </Link>
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700"
            >
              Sign in
            </Link>
            <Link
              href="/customer/signup"
              onClick={() => setOpen(false)}
              className="rounded-lg bg-indigo-600 px-3 py-2.5 text-center text-sm font-medium text-white"
            >
              Find a property
            </Link>
            <Link
              href="/agency/signup"
              onClick={() => setOpen(false)}
              className="rounded-lg bg-violet-600 px-3 py-2.5 text-center text-sm font-medium text-white"
            >
              Join as agency
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
