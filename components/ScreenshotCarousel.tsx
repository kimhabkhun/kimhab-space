"use client";

import { useRef } from "react";

export default function ScreenshotCarousel({
  screenshots,
  appName,
}: {
  screenshots: string[];
  appName: string;
}) {
  const track = useRef<HTMLUListElement>(null);

  function scroll(dir: -1 | 1) {
    track.current?.scrollBy({
      left: dir * Math.round(track.current.clientWidth * 0.7),
      behavior: "smooth",
    });
  }

  return (
    <div className="relative">
      <ul
        ref={track}
        className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2"
        aria-label={`${appName} screenshots`}
      >
        {screenshots.map((src, i) => (
          <li key={src} className="shrink-0 snap-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={`${appName} screenshot ${i + 1} of ${screenshots.length}`}
              width={230}
              height={489}
              loading="lazy"
              className="h-[420px] w-auto rounded-2xl border border-white/10"
            />
          </li>
        ))}
      </ul>

      {screenshots.length > 1 && (
        <div className="mt-3 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => scroll(-1)}
            aria-label="Previous screenshots"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-raised text-ink/80 transition-colors hover:text-ink"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M9 1L3 7l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            aria-label="Next screenshots"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-raised text-ink/80 transition-colors hover:text-ink"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M5 1l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
