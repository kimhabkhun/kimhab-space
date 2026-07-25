import Link from "next/link";
import Starfield from "@/components/Starfield";

export default function NotFound() {
  return (
    <div className="relative flex min-h-[70vh] flex-col items-center justify-center overflow-hidden px-4 text-center">
      <Starfield />
      <p className="relative font-mono text-sm tracking-widest text-muted">
        404
      </p>
      <h1 className="text-hero relative mt-4 font-display font-bold">
        Lost in space.
      </h1>
      <p className="relative mt-4 max-w-sm text-muted">
        This page drifted out of orbit — or never existed. Either way,
        there&apos;s nothing out here.
      </p>
      <Link
        href="/"
        className="btn-grad relative mt-8 inline-block px-6 py-3 text-sm"
      >
        Take me home
      </Link>
    </div>
  );
}
