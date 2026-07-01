const footerLinks = {
  Product: [
    { label: "How it works", href: "#how-it-works" },
    { label: "For customers", href: "/customer/signup" },
    { label: "For agencies", href: "/agency/signup" },
    { label: "Benefits", href: "#benefits" },
  ],
  Company: [
    { label: "About", href: "#" },
    { label: "Contact", href: "#" },
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <p className="text-2xl font-bold text-white">Findly</p>
            <p className="mt-4 max-w-sm leading-relaxed">
              The reverse property marketplace. Customers describe what they
              need. Agencies respond with the right properties.
            </p>
          </div>

          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <p className="text-sm font-semibold uppercase tracking-wide text-white">
                {group}
              </p>
              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm transition hover:text-white"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-8 sm:flex-row">
          <p className="text-sm">
            © {new Date().getFullYear()} Findly. All rights reserved.
          </p>
          <p className="text-sm text-slate-500">
            Customer need → Agency response
          </p>
        </div>
      </div>
    </footer>
  );
}
