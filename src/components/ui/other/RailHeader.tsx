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
 * Shared heading for every content rail, shaped like an old cinema board: a
 * rounded plaque with a marquee bulb strip, the title letter-spaced inside it
 * and a frosted "See all" chip on the far side.
 */
const RailHeader: React.FC<RailHeaderProps> = ({ title, href, hint, className }) => (
  <div className={cn("flex min-w-0 items-center justify-between gap-3", className)}>
    <Link href={href} className="group min-w-0" aria-label={`Browse ${title}`}>
      <span className="sf-board">
        <span className="sf-bulb" aria-hidden />
        <span className="sf-board-title transition-colors group-hover:text-white">{title}</span>
      </span>
    </Link>

    <div className="flex shrink-0 items-center gap-2">
      {hint && (
        <span className="hidden text-[10px] tracking-[0.12em] text-white/35 uppercase sm:block">
          {hint}
        </span>
      )}
      <Link
        href={href}
        className="sf-chip !px-2.5 !py-1 !text-[10px] tracking-[0.1em] uppercase transition-colors hover:bg-white/15"
        aria-label={`See all ${title}`}
      >
        See all
      </Link>
    </div>
  </div>
);

export default RailHeader;
