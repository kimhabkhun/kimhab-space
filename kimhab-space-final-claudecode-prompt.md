# Kimhab Space — FINAL Claude Code Prompt (v5)

Copy everything inside the code block below and paste it into Claude Code as one command. It contains the full product spec + a complete senior-level UX/UI design system, so Claude Code can build the entire site in one run.

---

````
Build a complete, production-ready static website called "Kimhab Space" — a free, safe download hub where I distribute my own Android apps (and later iOS). Build EVERYTHING described below in one run: full project setup, all pages, all components, design system, sample data, and deploy config. Do not ask questions; make reasonable choices and finish.

====================================================
1. TECH STACK & PROJECT SETUP
====================================================
- Next.js 15 (App Router) with STATIC EXPORT: `output: "export"` in next.config — zero server code
- TypeScript strict mode
- Tailwind CSS v4
- Framer Motion for animations
- Deployable on Cloudflare Pages (add a note in README: build command `npx next build`, output dir `out`)
- All app data comes from ONE file: `data/apps.ts` (no database, no admin, no API)
- Images live in `/public` (create simple placeholder icons/screenshots as SVGs so the site runs immediately)
- Include a README explaining: how to add a new app, how to add a new version (upload APK to MediaFire → compute SHA-256 locally → add entry → git push)

====================================================
2. DATA MODEL — data/apps.ts
====================================================
export type AppVersion = {
  versionName: string;      // "1.2.0"
  versionCode: number;
  releasedAt: string;       // ISO date
  minAndroid: string;       // "8.0"
  fileSizeMB: number;
  mediafireUrl: string;     // download link (MediaFire)
  sha256: string;
  changelog: string[];
};

export type App = {
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  category: "Music" | "Tools" | "Fitness" | "Productivity";
  platforms: ("android" | "ios")[];
  icon: string;
  screenshots: string[];
  permissions: string[];    // "Storage — to read your music files"
  ios?: { testflightUrl?: string; appstoreUrl?: string };
  versions: AppVersion[];   // newest first; versions[0] = Latest
  published: boolean;
  accent?: string;          // optional per-app accent hex used on its card/detail glow
};

Seed it with 5 sample apps matching my real projects (placeholder links + fake checksums, clearly marked TODO):
1. Offline Music Player (Music)
2. QR & Barcode Scanner (Tools)
3. FitFlow workout tracker (Fitness)
4. Voice Changer (Tools)
5. Activity Planner (Productivity)
Each with 2–3 versions and realistic changelogs.

====================================================
3. DESIGN SYSTEM — "PERSONAL UNIVERSE" DIRECTION
====================================================
Concept: Kimhab Space is one developer's personal universe — every app is a small planet in orbit. Cosmic, playful, Gen-Z, but disciplined: ONE signature moment, everything else quiet and precise. This must NOT look like a generic dark template.

COLOR TOKENS (define as CSS variables in globals.css):
- --void:    #0B0D1A   (page background — deep space navy, never pure black)
- --surface: #14172B   (cards, panels)
- --raised:  #1D2140   (hover states, elevated chips)
- --ink:     #EDEEFF   (primary text)
- --muted:   #9AA0C3   (secondary text)
- --nebula:  #7C5CFF   (primary accent — violet; buttons, links, focus rings)
- --aurora:  #4DE1FF   (secondary accent — cyan; used ONLY in the hero gradient and tiny highlights)
- --star:    #FFD166   (trust color — checksum chips, "verified" badge, ratings)
- Gradient token: linear-gradient(120deg, var(--nebula), var(--aurora)) — reserved for the hero wordmark and primary CTA only. Do not spray it everywhere.

TYPOGRAPHY (Google Fonts via next/font):
- Display: "Unbounded" — rounded, futuristic, unmistakably Gen-Z. Use ONLY for the wordmark, page titles (h1), and app names on detail pages. Weight 600–700, tight tracking.
- Body/UI: "Space Grotesk" — thematically earned by the name, crisp and technical. 400/500.
- Data: "JetBrains Mono" — version numbers, file sizes, dates, and especially SHA-256 checksums. Checksums in mono inside a star-yellow-bordered chip is a core trust signal.
Type scale: 12 / 14 / 16 / 20 / 28 / 40 / clamp(2.75rem–5rem) for hero.

SIGNATURE ELEMENT (the one bold thing — execute this well):
The homepage hero is an "orbit field": the wordmark "Kimhab Space" set huge in Unbounded with the nebula→aurora gradient, and the 5 app icons slowly orbiting around it on 2–3 elliptical paths (CSS/Framer animation, 40–60s loops, slight parallax on mouse move). Each orbiting icon is clickable → its app page. On mobile, orbits collapse into a gently floating cluster above the wordmark. Respect prefers-reduced-motion: freeze orbits into a static constellation.

BACKGROUND ATMOSPHERE (subtle, not noisy):
- A sparse starfield: ~80 tiny dots at 2 sizes, opacity 0.15–0.35, a few twinkling on a 4–6s cycle
- One large, very soft radial nebula glow (violet, 8% opacity) behind the hero
- Fine grain/noise overlay at ~3% opacity for texture
- NOTHING else. No floating blobs, no glassmorphism everywhere.

COMPONENTS & FEEL:
- Cards: --surface, border 1px rgba(255,255,255,0.06), radius 20px, on hover: lift 4px + border glows with the app's accent color + icon tilts 3deg. Spring transitions (Framer), 150–250ms.
- Primary button ("Download"): gradient fill, radius 14px, bold Space Grotesk, subtle inner glow on hover; secondary buttons are outlined --nebula.
- Checksum chip: JetBrains Mono, truncated hash with copy-to-clipboard button, --star border, tooltip "Verify this file is genuine". Copy action → chip briefly flashes "Copied ✓".
- Platform badges: tiny pill chips (Android green dot / iOS grey dot + label).
- Version history: vertical timeline; the Latest node is a filled --star dot labeled "LATEST", older nodes hollow. Timeline is real sequence data, so numbered/ordered treatment is earned here.
- Category filter: horizontal scrollable pill row, active pill filled --nebula.
- Micro-interactions only where they inform: download button press → tiny "launch" scale pop; no confetti, no cursor trails.

VOICE & COPY (write all real copy, no lorem ipsum):
- Casual-confident Gen-Z but useful, sentence case, plain verbs. Examples:
  - Hero tagline: "My apps. Free forever. No ads, no tracking, no catch."
  - Trust strip: "✦ 100% free  ✦ Checksum-verified  ✦ Zero trackers"
  - Empty search: "Nothing in this galaxy yet — try another search."
  - Download hint: "Heads up: MediaFire shows ads. The real button is the green one."
- Buttons say what they do: "Download v1.2.0", "Copy checksum", "View older versions".

ACCESSIBILITY QUALITY FLOOR (non-negotiable):
- Responsive down to 360px; test nav + hero on mobile
- Visible keyboard focus rings (--nebula, 2px offset) on all interactive elements
- prefers-reduced-motion respected globally
- Color contrast AA on all text (check --muted on --void)
- Semantic HTML, alt text, skip-to-content link

====================================================
4. PAGES (all static, all from data/apps.ts)
====================================================
/            Home: orbit-field hero, trust strip, "Latest drops" grid (published apps), footer
/apps        All apps: search input + category pills (client-side), responsive card grid
/apps/[slug] App detail: icon + name (Unbounded) + accent glow, screenshots carousel,
             latest version panel (size, min Android, date, Download button, checksum chip),
             changelog, version-history timeline with per-version downloads + checksums,
             permissions list ("what it can touch"), iOS buttons if ios links exist
/install     How to install: Android unknown-sources steps, MediaFire fake-button warning
             (illustrated), how to verify SHA-256 (Windows/Mac/Linux one-liners), FAQ accordion
/about       Who I am, why Kimhab Space exists, the no-ads promise
/terms       Terms of Service: apps free "as is" no warranty; no liability for misuse or
             modified copies from elsewhere; no redistribution/reselling; apps may change or
             be discontinued anytime; governing law Cambodia
/privacy     Privacy Policy: site collects nothing (static, no accounts, no trackers);
             MediaFire is third-party with its own policy; per-app data note
/contact     Simple: email (mailto) + Telegram link placeholders, styled nicely — no forms
404          On-theme: "Lost in space." + link home

Shared layout: sticky top nav (wordmark left, links right, mobile hamburger with slide-over),
footer with orbit divider line + all page links + "Built by Kimhab" credit.

====================================================
5. BEFORE CODING
====================================================
Write a 10-line design plan first (palette, type, layout per page, signature) and check it
against this brief — if anything reads like a generic dark-mode template, revise it. Then build
exactly to the plan. After building, run the build, fix all errors, and confirm `npx next build`
produces a clean static export in /out.
````

---

## Why these design choices (quick review notes for you)

- **"Personal universe" concept** — your platform name earns the space theme honestly; each app orbiting the wordmark tells visitors "one person made all of these" in a single glance. That's the memorable signature; everything else stays quiet so it lands.
- **Unbounded + Space Grotesk + JetBrains Mono** — Gen-Z display personality, technical body, and mono checksums that *look* like security. The checksum chip doubles as your trust branding.
- **Violet/cyan on deep navy, yellow for trust** — cosmic without being the generic black-and-neon-green template; the yellow "star" color makes verification elements pop as their own recognizable thing.
- **Restraint rules included** — gradient reserved for two places, motion respects reduced-motion, contrast AA, 360px responsive. Cool, but it won't look AI-generated or fall apart on a phone.
- **Copy is written in-brief** — casual Gen-Z voice with genuinely useful lines (like the MediaFire fake-button warning) so Claude Code doesn't fill your site with lorem ipsum.

## How to use

1. Open Claude Code in an empty folder
2. Paste the entire code block above as your first message
3. Let it run — it will scaffold, build all pages, and verify the static export
4. Replace placeholder MediaFire links + checksums in `data/apps.ts` with real ones
5. Push to GitHub → connect to Cloudflare Pages (build: `npx next build`, output: `out`)
