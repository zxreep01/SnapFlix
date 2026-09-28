"use client";

import { cn } from "@/utils/helpers";
import Link from "next/link";

interface RailHeaderProps {
  title: string;
  href: string;
  /** Optional trailing hint shown next to the "See all" chip. */
  hint?: string;
  className?: string;
}

/**
 * Shared heading for every content rail: a truncating title plus a frosted
 * "See all" chip, both pointing at the matching discover collection.
 */
const RailHeader: React.FC<RailHeaderProps> = ({ title, href, hint, className }) => (
  <div className={cn("flex min-w-0 items-center justify-between gap-3", className)}>
    <Link href={href} className="group flex min-w-0 items-center gap-2">
      <h2 className="truncate text-base font-bold tracking-wide text-white transition-colors group-hover:text-white/80 sm:text-lg md:text-xl">
        {title}
      </h2>
      <span className="hidden shrink-0 text-[11px] font-bold text-[var(--sf-accent)] opacity-0 transition-opacity group-hover:opacity-100 lg:block">
        Explore
      </span>
    </Link>

    <div className="flex shrink-0 items-center gap-2">
      {hint && <span className="hidden text-[11px] text-white/40 sm:block">{hint}</span>}
      <Link
        href={href}
        className="sf-chip !px-3 transition-colors hover:bg-white/20"
        aria-label={`See all ${title}`}
      >
        See all
      </Link>
    </div>
  </div>
);

export default RailHeader;
