import Link from "next/link";

const columns = [
  {
    title: "Explore",
    links: [
      { href: "/apps", label: "All apps" },
      { href: "/tools/apk-verifier", label: "App verifier" },
      { href: "/install", label: "How to install" },
      { href: "/about", label: "About" },
    ],
  },
  {
    title: "Boring but important",
    links: [
      { href: "/terms", label: "Terms of Service" },
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/contact", label: "Contact" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-24">
      {/* Orbit divider — a thin path with one satellite on it */}
      <div aria-hidden="true" className="mx-auto max-w-6xl px-6">
        <svg
          viewBox="0 0 1200 40"
          className="h-10 w-full"
          preserveAspectRatio="none"
        >
          <path
            d="M0 20 Q 600 44 1200 20"
            fill="none"
            stroke="rgba(255,255,255,0.10)"
            strokeDasharray="3 6"
          />
          <circle cx="600" cy="32" r="4" fill="var(--nebula)" />
          <circle cx="600" cy="32" r="8" fill="none" stroke="rgba(124,92,255,0.35)" />
        </svg>
      </div>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <p className="font-display text-sm font-bold">
            Kimhab <span className="text-grad">Space</span>
          </p>
          <p className="mt-3 max-w-xs text-sm text-muted">
            One developer&apos;s universe of free apps. No ads, no tracking, no
            catch — verify every download with its checksum.
          </p>
        </div>
        {columns.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <p className="text-xs font-medium uppercase tracking-widest text-muted">
              {col.title}
            </p>
            <ul className="mt-3 space-y-2">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-ink/80 transition-colors hover:text-ink"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-white/5 py-6 text-center text-xs text-muted">
        <p>
          Built by Kimhab <span className="text-star">✦</span> © 2026 Kimhab
          Space
        </p>
      </div>
    </footer>
  );
}
