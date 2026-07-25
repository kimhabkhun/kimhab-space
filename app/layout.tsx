import type { Metadata, Viewport } from "next";
import { Unbounded, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

const unbounded = Unbounded({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-unbounded",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-space-grotesk",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: {
    default: "Kimhab Space — free apps, no catch",
    template: "%s · Kimhab Space",
  },
  description:
    "One developer's personal universe of free Android apps. No ads, no tracking, checksum-verified downloads.",
};

export const viewport: Viewport = {
  themeColor: "#0B0D1A",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${unbounded.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} min-h-screen bg-void text-ink font-body flex flex-col`}
      >
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[80] focus:rounded-lg focus:bg-nebula focus:px-4 focus:py-2 focus:text-void focus:font-medium"
        >
          Skip to content
        </a>
        <div className="grain" aria-hidden="true" />
        <Nav />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
