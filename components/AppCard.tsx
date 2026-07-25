"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { App } from "@/data/apps";
import PlatformBadges from "@/components/PlatformBadges";

const DEFAULT_ACCENT = "#7C5CFF";

export default function AppCard({ app }: { app: App }) {
  const accent = app.accent ?? DEFAULT_ACCENT;
  const latest = app.versions[0];

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
      className="group h-full"
      style={{ "--accent": accent } as React.CSSProperties}
    >
      <Link
        href={`/apps/${app.slug}`}
        className="flex h-full flex-col rounded-[20px] border border-white/[0.06] bg-surface p-5 transition-[border-color,box-shadow] duration-200 group-hover:border-[color-mix(in_srgb,var(--accent)_55%,transparent)] group-hover:shadow-[0_10px_40px_-12px_color-mix(in_srgb,var(--accent)_45%,transparent)]"
      >
        <div className="flex items-start gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={app.icon}
            alt=""
            width={64}
            height={64}
            className="rounded-2xl transition-transform duration-200 group-hover:rotate-3"
          />
          <div className="min-w-0">
            <h3 className="truncate text-xl font-medium">{app.name}</h3>
            <p className="mt-0.5 text-xs uppercase tracking-widest text-muted">
              {app.category}
            </p>
          </div>
        </div>

        <p className="mt-4 flex-1 text-sm leading-relaxed text-muted">
          {app.shortDescription}
        </p>

        <div className="mt-5 flex items-center justify-between gap-3">
          <PlatformBadges platforms={app.platforms} />
          <span className="font-mono text-xs text-muted">
            v{latest.versionName} · {latest.fileSizeMB} MB
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
