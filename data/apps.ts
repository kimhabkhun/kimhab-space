// ============================================================
// Kimhab Space — single source of truth for every app on the site.
// No database, no admin, no API. Edit this file, git push, done.
//
// TODO: every mediafireUrl and sha256 below is a PLACEHOLDER.
// Replace them with real MediaFire links and real checksums
// (see README.md for the exact workflow) before going live.
// ============================================================

export type AppVersion = {
  versionName: string; // "1.2.0"
  versionCode: number;
  releasedAt: string; // ISO date
  minAndroid: string; // "8.0"
  fileSizeMB: number;
  mediafireUrl: string; // download link (MediaFire)
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
  permissions: string[]; // "Storage — to read your music files"
  ios?: { testflightUrl?: string; appstoreUrl?: string };
  versions: AppVersion[]; // newest first; versions[0] = Latest
  published: boolean;
  accent?: string; // optional per-app accent hex used on its card/detail glow
};

export const apps: App[] = [
  {
    slug: "offline-music-player",
    name: "Offline Music Player",
    shortDescription: "Your music, no internet needed. Folders, playlists, sleep timer.",
    description:
      "A fast, clean music player that treats your local files with respect. Point it at any folder and it builds your library instantly — no cloud, no account, no 'premium' nag screens. Gapless playback, a proper equalizer, embedded lyrics support, and a sleep timer for late-night listening. It never touches the network, so your library stays yours.",
    category: "Music",
    platforms: ["android"],
    icon: "/icons/offline-music-player.svg",
    screenshots: [
      "/screens/offline-music-player-1.svg",
      "/screens/offline-music-player-2.svg",
      "/screens/offline-music-player-3.svg",
    ],
    permissions: [
      "Storage — to read your music files",
      "Notifications — playback controls on your lock screen",
    ],
    accent: "#7C5CFF",
    published: true,
    versions: [
      {
        versionName: "1.2.0",
        versionCode: 12,
        releasedAt: "2026-07-04",
        minAndroid: "8.0",
        fileSizeMB: 9.4,
        mediafireUrl:
          "https://www.mediafire.com/file/TODO_REPLACE/offline-music-player-1.2.0.apk/file", // TODO: real link
        sha256:
          "3c9a1f0d7b42e6a58f13c0de9b76a4218e5f02c3a9d84b167f20e3d1c5a8b904", // TODO: real checksum
        changelog: [
          "New: sleep timer with fade-out (15/30/60 min)",
          "New: swipe left on a track to queue it next",
          "Improved: library scan is ~3x faster on big folders",
          "Fixed: album art missing for some FLAC files",
        ],
      },
      {
        versionName: "1.1.0",
        versionCode: 11,
        releasedAt: "2026-05-19",
        minAndroid: "8.0",
        fileSizeMB: 9.1,
        mediafireUrl:
          "https://www.mediafire.com/file/TODO_REPLACE/offline-music-player-1.1.0.apk/file", // TODO: real link
        sha256:
          "8e2b6c4f91a0d3e7b5c8f2a1d6094e3b7a5c1f8d2e6b094a3c7d5e1f8b2a6c40", // TODO: real checksum
        changelog: [
          "New: 5-band equalizer with bass boost",
          "New: embedded lyrics view (tap the album art)",
          "Fixed: playback stopping when screen locks on some devices",
        ],
      },
      {
        versionName: "1.0.0",
        versionCode: 10,
        releasedAt: "2026-03-08",
        minAndroid: "8.0",
        fileSizeMB: 8.7,
        mediafireUrl:
          "https://www.mediafire.com/file/TODO_REPLACE/offline-music-player-1.0.0.apk/file", // TODO: real link
        sha256:
          "1f7d3a9c5e8b2064d1c7a3f9e5b8d2c604a1e7f3b9d5c8a2e604f1b7d3a9c5e8", // TODO: real checksum
        changelog: [
          "First release: folder-based library, playlists, gapless playback",
        ],
      },
    ],
  },
  {
    slug: "qr-barcode-scanner",
    name: "QR & Barcode Scanner",
    shortDescription: "Scan anything, keep nothing. No ads, no history sold to anyone.",
    description:
      "A scanner that does exactly one job and shuts up about it. QR codes, EAN, UPC, Code 128 — scanned locally on your device, decoded instantly, and shown to you with safe-link preview before anything opens. History is stored on-device only and you can wipe it with one tap. No camera uploads, no analytics, no 'free trial'.",
    category: "Tools",
    platforms: ["android"],
    icon: "/icons/qr-barcode-scanner.svg",
    screenshots: [
      "/screens/qr-barcode-scanner-1.svg",
      "/screens/qr-barcode-scanner-2.svg",
      "/screens/qr-barcode-scanner-3.svg",
    ],
    permissions: [
      "Camera — to scan codes (frames never leave your device)",
    ],
    accent: "#4DE1FF",
    published: true,
    versions: [
      {
        versionName: "2.1.0",
        versionCode: 21,
        releasedAt: "2026-06-21",
        minAndroid: "7.0",
        fileSizeMB: 5.2,
        mediafireUrl:
          "https://www.mediafire.com/file/TODO_REPLACE/qr-barcode-scanner-2.1.0.apk/file", // TODO: real link
        sha256:
          "b4e8c2a6f0d3197e5b8c4a2f6d0e3b97a5c8e2f4b6d019a3c7e5f2b8d4a6c091", // TODO: real checksum
        changelog: [
          "New: batch scan mode — scan a stack of codes in one session",
          "New: export history as CSV",
          "Improved: low-light scanning with auto torch suggestion",
        ],
      },
      {
        versionName: "2.0.1",
        versionCode: 20,
        releasedAt: "2026-04-30",
        minAndroid: "7.0",
        fileSizeMB: 5.1,
        mediafireUrl:
          "https://www.mediafire.com/file/TODO_REPLACE/qr-barcode-scanner-2.0.1.apk/file", // TODO: real link
        sha256:
          "c7a1e5f9b3d80264c8a1f5e9b3d76024a8c1e5f9b3d80264a8c1f5e9b3d76024", // TODO: real checksum
        changelog: [
          "Fixed: crash when scanning some Wi-Fi QR codes",
          "Fixed: flashlight staying on after closing the app",
        ],
      },
      {
        versionName: "2.0.0",
        versionCode: 19,
        releasedAt: "2026-04-12",
        minAndroid: "7.0",
        fileSizeMB: 5.0,
        mediafireUrl:
          "https://www.mediafire.com/file/TODO_REPLACE/qr-barcode-scanner-2.0.0.apk/file", // TODO: real link
        sha256:
          "d2f6b0a4e8c31597d2f6b0a4e8c31597d2f6b0a4e8c31597d2f6b0a4e8c31597", // TODO: real checksum
        changelog: [
          "Rebuilt scanner engine — locks onto codes ~2x faster",
          "New: safe-link preview before opening any URL",
          "New: on-device-only history with one-tap wipe",
        ],
      },
    ],
  },
  {
    slug: "fitflow",
    name: "FitFlow",
    shortDescription: "Workout tracker that stays out of your way. Sets, reps, rest — done.",
    description:
      "FitFlow is the workout log I actually wanted: open it, tap your routine, log sets with two thumbs while the rest timer runs. Progress charts for every lift, plate calculator, and routines you build once and reuse forever. Everything lives on your phone. Export your history as CSV anytime — your training data belongs to you, not a subscription.",
    category: "Fitness",
    platforms: ["android", "ios"],
    icon: "/icons/fitflow.svg",
    screenshots: [
      "/screens/fitflow-1.svg",
      "/screens/fitflow-2.svg",
      "/screens/fitflow-3.svg",
    ],
    permissions: [
      "Notifications — rest timer alerts",
      "Vibration — haptic buzz when rest is over",
    ],
    ios: {
      testflightUrl: "https://testflight.apple.com/join/TODO_REPLACE", // TODO: real TestFlight link
    },
    accent: "#FF6B8B",
    published: true,
    versions: [
      {
        versionName: "0.9.2",
        versionCode: 9,
        releasedAt: "2026-07-15",
        minAndroid: "9.0",
        fileSizeMB: 12.8,
        mediafireUrl:
          "https://www.mediafire.com/file/TODO_REPLACE/fitflow-0.9.2.apk/file", // TODO: real link
        sha256:
          "e5c9a3f7b1d62480e5c9a3f7b1d62480e5c9a3f7b1d62480e5c9a3f7b1d62480", // TODO: real checksum
        changelog: [
          "New: plate calculator on every barbell exercise",
          "Improved: rest timer keeps running if you switch apps",
          "Fixed: chart tooltips overlapping on small screens",
        ],
      },
      {
        versionName: "0.9.0",
        versionCode: 8,
        releasedAt: "2026-06-02",
        minAndroid: "9.0",
        fileSizeMB: 12.5,
        mediafireUrl:
          "https://www.mediafire.com/file/TODO_REPLACE/fitflow-0.9.0.apk/file", // TODO: real link
        sha256:
          "f0b4d8e2c6a91375f0b4d8e2c6a91375f0b4d8e2c6a91375f0b4d8e2c6a91375", // TODO: real checksum
        changelog: [
          "Open beta! Routines, set logging, rest timer, progress charts",
          "CSV export of full training history",
        ],
      },
    ],
  },
  {
    slug: "voice-changer",
    name: "Voice Changer",
    shortDescription: "Record, morph, share. Robot to chipmunk in two taps.",
    description:
      "Record a clip (or import one) and run it through 12 voice effects — robot, deep space, chipmunk, cave echo, and more. Preview instantly, stack up to two effects, and export as MP3 to share anywhere. All processing happens on your device; your recordings never get uploaded. Made for memes, voice notes, and confusing your friends.",
    category: "Tools",
    platforms: ["android"],
    icon: "/icons/voice-changer.svg",
    screenshots: [
      "/screens/voice-changer-1.svg",
      "/screens/voice-changer-2.svg",
      "/screens/voice-changer-3.svg",
    ],
    permissions: [
      "Microphone — to record your voice clips",
      "Storage — to save and export your recordings",
    ],
    accent: "#5EF2B8",
    published: true,
    versions: [
      {
        versionName: "1.4.1",
        versionCode: 15,
        releasedAt: "2026-06-28",
        minAndroid: "8.0",
        fileSizeMB: 7.6,
        mediafireUrl:
          "https://www.mediafire.com/file/TODO_REPLACE/voice-changer-1.4.1.apk/file", // TODO: real link
        sha256:
          "a8d2f6c0b4e97531a8d2f6c0b4e97531a8d2f6c0b4e97531a8d2f6c0b4e97531", // TODO: real checksum
        changelog: [
          "Fixed: exported MP3s silent on some Samsung devices",
          "Fixed: waveform view drifting out of sync on long clips",
        ],
      },
      {
        versionName: "1.4.0",
        versionCode: 14,
        releasedAt: "2026-06-10",
        minAndroid: "8.0",
        fileSizeMB: 7.6,
        mediafireUrl:
          "https://www.mediafire.com/file/TODO_REPLACE/voice-changer-1.4.0.apk/file", // TODO: real link
        sha256:
          "b9e3a7d1c5f08642b9e3a7d1c5f08642b9e3a7d1c5f08642b9e3a7d1c5f08642", // TODO: real checksum
        changelog: [
          "New: two effects — 'deep space' and 'tin can radio'",
          "New: stack up to two effects on one clip",
          "Improved: export is ~40% faster",
        ],
      },
      {
        versionName: "1.3.2",
        versionCode: 13,
        releasedAt: "2026-04-22",
        minAndroid: "8.0",
        fileSizeMB: 7.3,
        mediafireUrl:
          "https://www.mediafire.com/file/TODO_REPLACE/voice-changer-1.3.2.apk/file", // TODO: real link
        sha256:
          "c0f4b8e2d6a19753c0f4b8e2d6a19753c0f4b8e2d6a19753c0f4b8e2d6a19753", // TODO: real checksum
        changelog: [
          "Fixed: import failing for M4A files",
          "Improved: recording quality on devices with dual mics",
        ],
      },
    ],
  },
  {
    slug: "activity-planner",
    name: "Activity Planner",
    shortDescription: "Plan your week like a human. Blocks, streaks, zero guilt.",
    description:
      "A weekly planner built around time blocks instead of endless to-do lists. Drag activities onto your week, set gentle reminders, and watch streaks build for the habits you actually keep. Missed a day? Nothing shames you — the plan just rolls forward. Works fully offline, backs up to a local file you control.",
    category: "Productivity",
    platforms: ["android"],
    icon: "/icons/activity-planner.svg",
    screenshots: [
      "/screens/activity-planner-1.svg",
      "/screens/activity-planner-2.svg",
      "/screens/activity-planner-3.svg",
    ],
    permissions: [
      "Notifications — activity reminders you set yourself",
    ],
    accent: "#FF9F6B",
    published: true,
    versions: [
      {
        versionName: "1.1.0",
        versionCode: 3,
        releasedAt: "2026-07-19",
        minAndroid: "8.1",
        fileSizeMB: 10.3,
        mediafireUrl:
          "https://www.mediafire.com/file/TODO_REPLACE/activity-planner-1.1.0.apk/file", // TODO: real link
        sha256:
          "d1a5c9f3e7b20864d1a5c9f3e7b20864d1a5c9f3e7b20864d1a5c9f3e7b20864", // TODO: real checksum
        changelog: [
          "New: streaks view with a monthly heat map",
          "New: duplicate a whole week as a template",
          "Fixed: reminders firing twice after device restart",
        ],
      },
      {
        versionName: "1.0.0",
        versionCode: 2,
        releasedAt: "2026-05-28",
        minAndroid: "8.1",
        fileSizeMB: 9.9,
        mediafireUrl:
          "https://www.mediafire.com/file/TODO_REPLACE/activity-planner-1.0.0.apk/file", // TODO: real link
        sha256:
          "e2b6d0a4f8c31975e2b6d0a4f8c31975e2b6d0a4f8c31975e2b6d0a4f8c31975", // TODO: real checksum
        changelog: [
          "First release: weekly time blocks, reminders, local backup/restore",
        ],
      },
    ],
  },
];
