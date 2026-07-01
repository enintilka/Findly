export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="text-center sm:text-left">
            <p className="text-xl font-bold text-white">Findly</p>
            <p className="mt-1 text-sm text-gray-400">
              Owners post requests. Agencies browse, chat, and meet in person.
            </p>
          </div>

          <nav className="flex flex-wrap justify-center gap-6 text-sm">
            <a href="/browse" className="transition hover:text-white">
              Browse requests
            </a>
            <a href="/signup/vendor" className="transition hover:text-white">
              For owners
            </a>
            <a href="/signup/agency" className="transition hover:text-white">
              For agencies
            </a>
          </nav>
        </div>

        <div className="mt-8 border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Findly. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
