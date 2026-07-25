/**
 * Sparse starfield: ~80 tiny dots at 2 sizes, opacity 0.15–0.35,
 * every 7th one twinkling on a 4–6s cycle. Seeded PRNG so the
 * server and client render the exact same sky (no hydration diff).
 */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20260725);
const STARS = Array.from({ length: 80 }, (_, i) => ({
  left: rand() * 100,
  top: rand() * 100,
  size: rand() > 0.5 ? 2 : 1,
  opacity: 0.15 + rand() * 0.2,
  twinkle: i % 7 === 0,
  dur: 4 + rand() * 2,
  delay: rand() * 5,
}));

export default function Starfield() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {STARS.map((s, i) => (
        <span
          key={i}
          className={`absolute rounded-full bg-ink ${s.twinkle ? "twinkle" : ""}`}
          style={
            {
              left: `${s.left}%`,
              top: `${s.top}%`,
              width: s.size,
              height: s.size,
              opacity: s.opacity,
              "--dur": `${s.dur.toFixed(2)}s`,
              "--delay": `${s.delay.toFixed(2)}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
