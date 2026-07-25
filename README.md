# Kimhab Space 🪐

A free, safe download hub for my Android apps (iOS later). Fully static —
no server, no database, no admin panel. All app data lives in **one file**:
[`data/apps.ts`](data/apps.ts).

Built with Next.js 15 (App Router, static export), TypeScript strict,
Tailwind CSS v4, and Framer Motion.

## Quick start

```bash
npm install
npm run dev        # local dev at http://localhost:3000
npx next build     # static export → ./out
```

## Deploying to Cloudflare Pages

1. Push this repo to GitHub.
2. In Cloudflare Pages: **Create project → connect the repo**.
3. Settings:
   - **Build command:** `npx next build`
   - **Build output directory:** `out`
4. Deploy. That's it — the site is 100% static files.

## How to add a new app

1. Draw/export an icon SVG into `public/icons/<slug>.svg` (512×512, rounded).
2. Add screenshots to `public/screens/<slug>-1.svg` (or `.png/.webp`), etc.
3. Open `data/apps.ts` and add a new object to the `apps` array:
   - pick a unique `slug` (it becomes the URL: `/apps/<slug>`),
   - fill in name, descriptions, category, permissions (use the
     `"Permission — plain-English reason"` format),
   - optionally set an `accent` hex — it tints the card glow and detail page,
   - add at least one entry in `versions` (see below),
   - set `published: true` when it's ready to show.
4. `git push` — done. The app appears on the home orbit, `/apps`, and gets
   its own detail page automatically.

## How to add a new version

1. **Build the APK** and note the version name/code and file size.
2. **Upload the APK to MediaFire** and copy the share link.
3. **Compute the SHA-256 locally** (on the exact file you uploaded):
   - Windows: `certutil -hashfile app.apk SHA256`
   - macOS: `shasum -a 256 app.apk`
   - Linux: `sha256sum app.apk`
4. **Add a version entry** at the **top** of that app's `versions` array in
   `data/apps.ts` (newest first — `versions[0]` is always "Latest"):

```ts
{
  versionName: "1.3.0",
  versionCode: 13,
  releasedAt: "2026-08-01",
  minAndroid: "8.0",
  fileSizeMB: 9.6,
  mediafireUrl: "https://www.mediafire.com/file/…/file",
  sha256: "the-hash-you-computed-in-step-3",
  changelog: [
    "New: the thing you added",
    "Fixed: the thing you broke last time",
  ],
},
```

5. `git push` — Cloudflare rebuilds and the new version goes live with its
   own timeline node, download button, and checksum chip.

> ⚠️ **Before going live:** every `mediafireUrl` and `sha256` currently in
> `data/apps.ts` is a placeholder marked `TODO`. Replace them with real
> links and real checksums. The Telegram link on `/contact` and FitFlow's
> TestFlight URL are placeholders too.

## Project map

```
data/apps.ts        ← the single source of truth (edit this 99% of the time)
app/                ← pages (home, apps, apps/[slug], install, about,
                       terms, privacy, contact, 404)
components/         ← OrbitHero (signature), AppCard, ChecksumChip,
                       VersionTimeline, carousel, nav, footer…
public/icons/       ← app icons (SVG)
public/screens/     ← app screenshots (SVG placeholders — replace with real)
app/globals.css     ← design tokens + orbit/starfield animations
```

## Design system notes

- Tokens: `--void` background, `--surface`/`--raised` panels, `--nebula`
  violet primary, `--aurora` cyan (hero only), `--star` yellow (trust
  signals only). The nebula→aurora gradient appears in exactly two places:
  the hero wordmark and primary CTAs.
- Fonts: Unbounded (wordmark/h1/app names), Space Grotesk (body),
  JetBrains Mono (versions, sizes, dates, checksums).
- `prefers-reduced-motion` freezes the orbit hero into a static
  constellation; all animations collapse globally.

Built by Kimhab ✦
