"use client";

import { useMemo, useState } from "react";
import type { App } from "@/data/apps";
import AppCard from "@/components/AppCard";

const CATEGORIES = ["All", "Music", "Tools", "Fitness", "Productivity"] as const;
type Category = (typeof CATEGORIES)[number];

export default function AppsExplorer({ apps }: { apps: App[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category>("All");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return apps.filter((app) => {
      if (category !== "All" && app.category !== category) return false;
      if (!q) return true;
      return (
        app.name.toLowerCase().includes(q) ||
        app.shortDescription.toLowerCase().includes(q) ||
        app.category.toLowerCase().includes(q)
      );
    });
  }, [apps, query, category]);

  return (
    <div>
      <div className="flex flex-col gap-4">
        <label className="relative block max-w-md">
          <span className="sr-only">Search apps</span>
          <svg
            aria-hidden="true"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
          >
            <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M11 11l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search apps…"
            className="w-full rounded-xl border border-white/10 bg-surface py-3 pl-11 pr-4 text-sm text-ink placeholder:text-muted focus:border-nebula"
          />
        </label>

        {/* Category filter: horizontal scrollable pill row */}
        <div
          role="tablist"
          aria-label="Filter by category"
          className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0"
        >
          {CATEGORIES.map((c) => {
            const active = c === category;
            return (
              <button
                key={c}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setCategory(c)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm transition-colors ${
                  active
                    ? "bg-nebula font-medium text-void"
                    : "border border-white/10 bg-surface text-muted hover:bg-raised hover:text-ink"
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      {filtered.length > 0 ? (
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((app) => (
            <li key={app.slug}>
              <AppCard app={app} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-16 text-center">
          <p aria-hidden="true" className="text-4xl">
            🛰️
          </p>
          <p className="mt-4 text-lg text-muted">
            Nothing in this galaxy yet — try another search.
          </p>
        </div>
      )}
    </div>
  );
}
