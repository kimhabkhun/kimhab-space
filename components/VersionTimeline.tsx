import type { App } from "@/data/apps";
import { formatDate } from "@/lib/apps";
import ChecksumChip from "@/components/ChecksumChip";
import DownloadButton from "@/components/DownloadButton";

/**
 * Vertical timeline of real release history — ordered treatment is
 * earned here. Latest node: filled star dot labeled LATEST; older
 * nodes are hollow.
 */
export default function VersionTimeline({ app }: { app: App }) {
  return (
    <ol className="relative ml-2 border-l border-white/10 pl-8">
      {app.versions.map((v, i) => {
        const isLatest = i === 0;
        return (
          <li key={v.versionCode} className="relative pb-10 last:pb-0">
            {/* Node dot */}
            <span
              aria-hidden="true"
              className={`absolute -left-[41px] top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                isLatest
                  ? "border-star bg-star"
                  : "border-white/25 bg-void"
              }`}
            />
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <h3 className="font-mono text-base font-medium">
                v{v.versionName}
              </h3>
              {isLatest && (
                <span className="rounded-full border border-star/60 bg-star/10 px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-widest text-star">
                  Latest
                </span>
              )}
              <span className="font-mono text-xs text-muted">
                {formatDate(v.releasedAt)} · {v.fileSizeMB} MB · Android{" "}
                {v.minAndroid}+
              </span>
            </div>

            <ul className="mt-3 space-y-1.5 text-sm text-muted">
              {v.changelog.map((line, j) => (
                <li key={j} className="flex gap-2">
                  <span aria-hidden="true" className="text-nebula">
                    –
                  </span>
                  {line}
                </li>
              ))}
            </ul>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <DownloadButton
                href={v.mediafireUrl}
                label={`Download v${v.versionName}`}
                secondary={!isLatest}
              />
              <ChecksumChip sha256={v.sha256} />
            </div>
          </li>
        );
      })}
    </ol>
  );
}
