import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Email or Telegram — bug reports, feature ideas, or just hello.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="font-display text-[2.5rem] font-bold leading-tight">
        Contact
      </h1>
      <p className="mt-3 max-w-lg text-muted">
        No forms, no ticket systems. Bug reports, feature ideas, checksum
        mismatches, or just hello — pick a channel.
      </p>

      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        <a
          href="mailto:khunkimhab7@gmail.com"
          className="group rounded-[20px] border border-white/[0.06] bg-surface p-6 transition-colors hover:border-nebula/50"
        >
          <span
            aria-hidden="true"
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-raised text-nebula"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <path d="M3 6l7 5 7-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <h2 className="mt-4 text-lg font-medium">Email</h2>
          <p className="mt-1 text-sm text-muted">
            Best for bug reports — include your app version.
          </p>
          <p className="mt-3 font-mono text-sm text-nebula group-hover:text-ink">
            khunkimhab7@gmail.com
          </p>
        </a>

        <a
          href="https://t.me/kimhabkhun"
          target="_blank"
          rel="noopener noreferrer"
          className="group rounded-[20px] border border-white/[0.06] bg-surface p-6 transition-colors hover:border-aurora/50"
        >
          <span
            aria-hidden="true"
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-raised text-aurora"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M17.5 3.2L2.9 9.1c-.8.3-.8 1.4.05 1.7l3.6 1.2 1.4 4.3c.25.75 1.2.9 1.7.3l2-2.4 3.7 2.7c.6.45 1.5.1 1.65-.65l2-11.4c.15-.9-.7-1.6-1.5-1.25z"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <h2 className="mt-4 text-lg font-medium">Telegram</h2>
          <p className="mt-1 text-sm text-muted">
            Quicker for short questions and hellos.
          </p>
          <p className="mt-3 font-mono text-sm text-aurora group-hover:text-ink">
            @kimhabkhun
          </p>
        </a>
      </div>

      <p className="mt-8 text-xs text-muted">
        Found a copy of my apps somewhere else on the internet? Don&apos;t
        install it — tell me instead. Only downloads from this site are
        checksum-verified.
      </p>
    </div>
  );
}
