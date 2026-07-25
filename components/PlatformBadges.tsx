export default function PlatformBadges({
  platforms,
}: {
  platforms: ("android" | "ios")[];
}) {
  return (
    <span className="flex items-center gap-1.5">
      {platforms.includes("android") && (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-raised px-2.5 py-1 text-xs text-ink/90">
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 rounded-full bg-[#3DDC84]"
          />
          Android
        </span>
      )}
      {platforms.includes("ios") && (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-raised px-2.5 py-1 text-xs text-ink/90">
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 rounded-full bg-neutral-400"
          />
          iOS
        </span>
      )}
    </span>
  );
}
