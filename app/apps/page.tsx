import type { Metadata } from "next";
import AppsExplorer from "@/components/AppsExplorer";
import { publishedApps } from "@/lib/apps";

export const metadata: Metadata = {
  title: "All apps",
  description:
    "Every app in the Kimhab Space universe — free, checksum-verified, zero trackers.",
};

export default function AppsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <h1 className="font-display text-[2.5rem] font-bold leading-tight">
        All apps
      </h1>
      <p className="mt-3 max-w-lg text-muted">
        Everything in the universe so far. All free, all verified — pick a
        planet.
      </p>
      <div className="mt-10">
        <AppsExplorer apps={publishedApps()} />
      </div>
    </div>
  );
}
