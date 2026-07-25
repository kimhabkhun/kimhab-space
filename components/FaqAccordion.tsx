export type FaqItem = { q: string; a: string };

/**
 * Native <details>/<summary> accordion — keyboard and screen-reader
 * friendly for free, styled to match the surface cards.
 */
export default function FaqAccordion({ items }: { items: FaqItem[] }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <details
          key={item.q}
          className="group rounded-2xl border border-white/[0.06] bg-surface open:border-nebula/40"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-medium marker:hidden [&::-webkit-details-marker]:hidden">
            {item.q}
            <span
              aria-hidden="true"
              className="text-muted transition-transform duration-200 group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <p className="px-5 pb-5 text-sm leading-relaxed text-muted">
            {item.a}
          </p>
        </details>
      ))}
    </div>
  );
}
