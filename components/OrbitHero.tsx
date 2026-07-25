"use client";

import Link from "next/link";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import type { App } from "@/data/apps";
import Starfield from "@/components/Starfield";

/**
 * The signature moment: "Kimhab Space" set huge with the nebula→aurora
 * gradient, and every published app orbiting it on elliptical paths.
 * Desktop: 3 rings, 42–62s loops, slight mouse parallax, each icon
 * clickable. Mobile: orbits collapse into a floating cluster above the
 * wordmark. prefers-reduced-motion freezes everything into a static
 * constellation (handled in CSS — base transforms hold the pose).
 */

type Sat = {
  app: App;
  radius: number;
  dur: number; // seconds per lap
  angle: number; // starting angle, degrees
};

const RINGS = [
  { radius: 235, dur: 42 },
  { radius: 320, dur: 52 },
  { radius: 405, dur: 62 },
];

function satellitesFor(apps: App[]): Sat[] {
  // Spread apps across rings inside-out, phase-shifted so they never clump.
  return apps.map((app, i) => {
    const ring = RINGS[i % RINGS.length];
    return {
      app,
      radius: ring.radius,
      dur: ring.dur,
      angle: (i * 360) / apps.length + (i % RINGS.length) * 24,
    };
  });
}

export default function OrbitHero({ apps }: { apps: App[] }) {
  const sats = satellitesFor(apps);
  const reduced = useReducedMotion();

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const px = useSpring(mx, { stiffness: 50, damping: 20 });
  const py = useSpring(my, { stiffness: 50, damping: 20 });

  function onMouseMove(e: React.MouseEvent<HTMLElement>) {
    if (reduced) return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(((e.clientX - r.left) / r.width - 0.5) * 24);
    my.set(((e.clientY - r.top) / r.height - 0.5) * 16);
  }

  return (
    <section
      onMouseMove={onMouseMove}
      className="relative flex min-h-[640px] items-center justify-center overflow-hidden md:min-h-[720px]"
      aria-label="Kimhab Space — my apps in orbit"
    >
      {/* One large, very soft nebula glow behind the hero */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[900px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(124,92,255,0.08) 0%, transparent 65%)",
        }}
      />
      <Starfield />

      {/* Orbit field — desktop only, with mouse parallax */}
      <motion.div
        aria-hidden={false}
        className="absolute inset-0 hidden md:block"
        style={{ x: px, y: py }}
      >
        <div className="absolute inset-0 scale-[0.72] lg:scale-90 xl:scale-100">
          {/* Static dashed ellipses marking the paths */}
          {RINGS.map((r) => (
            <div
              key={r.radius}
              aria-hidden="true"
              className="orbit-ellipse"
              style={{
                width: r.radius * 2,
                height: r.radius * 2,
                marginLeft: -r.radius,
                marginTop: -r.radius,
              }}
            />
          ))}

          {/* One invisible rotating carrier per app */}
          {sats.map((s) => {
            const delay = -(s.angle / 360) * s.dur;
            const vars = {
              "--dur": `${s.dur}s`,
              "--delay": `${delay}s`,
              "--angle": `${s.angle}deg`,
            } as React.CSSProperties;
            return (
              <div
                key={s.app.slug}
                className="orbit-carrier z-20"
                style={{
                  ...vars,
                  width: s.radius * 2,
                  height: s.radius * 2,
                  marginLeft: -s.radius,
                  marginTop: -s.radius,
                }}
              >
                <div className="orbit-sat" style={vars}>
                  <Link
                    href={`/apps/${s.app.slug}`}
                    title={s.app.name}
                    aria-label={`${s.app.name} — view app`}
                    className="block rounded-2xl border border-white/10 bg-surface p-1.5 shadow-lg transition-transform hover:scale-110"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={s.app.icon}
                      alt=""
                      width={44}
                      height={44}
                      className="rounded-xl"
                    />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Wordmark + tagline */}
      <div className="relative z-10 px-4 text-center">
        {/* Mobile: floating cluster above the wordmark */}
        <div className="mb-8 flex items-end justify-center gap-3 md:hidden">
          {sats.map((s, i) => (
            <Link
              key={s.app.slug}
              href={`/apps/${s.app.slug}`}
              aria-label={`${s.app.name} — view app`}
              className={`float-soft block rounded-2xl border border-white/10 bg-surface p-1 ${
                i % 2 === 0 ? "mb-3" : ""
              }`}
              style={
                {
                  "--dur": `${4.5 + i * 0.7}s`,
                  "--delay": `${-i * 1.3}s`,
                } as React.CSSProperties
              }
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.app.icon} alt="" width={40} height={40} className="rounded-xl" />
            </Link>
          ))}
        </div>

        <h1 className="text-hero font-display font-bold">
          <span className="text-grad">Kimhab Space</span>
        </h1>
        <p className="mx-auto mt-5 max-w-md text-lg text-muted sm:text-xl">
          My apps. Free forever. No ads, no tracking, no catch.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/apps" className="btn-grad px-6 py-3 text-sm">
            Browse the apps
          </Link>
          <Link href="/install" className="btn-outline px-6 py-3 text-sm">
            How to install
          </Link>
        </div>

        {/* Trust strip */}
        <p className="mt-10 text-sm text-muted">
          <span className="text-star">✦</span> 100% free{" "}
          <span className="mx-2 text-star">✦</span> Checksum-verified{" "}
          <span className="mx-2 text-star">✦</span> Zero trackers
        </p>
      </div>
    </section>
  );
}
