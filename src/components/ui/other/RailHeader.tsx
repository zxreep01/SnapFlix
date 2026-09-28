"use client";

import { cn } from "@/utils/helpers";
import Link from "next/link";

interface RailHeaderProps {
  title: string;
  href: string;
  className?: string;
}

/**
 * Shared heading for every content rail: a marquee board on the left, with the
 * same board acting as the link and a quiet "See all" on the far side.
 */
const RailHeader: React.FC<RailHeaderProps> = ({ title, href, className }) => (
  <div
    className={cn(
      "flex min-w-0 items-center justify-between gap-3 text-left",
      className,
    )}
  >
    <Link href={href} className="group min-w-0" aria-label={`Browse ${title}`}>
      <span className="sf-board">
        <span className="sf-bulb" aria-hidden />
        <span className="sf-board-title transition-colors group-hover:text-white">{title}</span>
      </span>
    </Link>

    <Link
      href={href}
      className="shrink-0 text-[11px] font-medium tracking-wide text-white/45 transition-colors hover:text-white"
      aria-label={`See all ${title}`}
    >
      See all
    </Link>
  </div>
);

export default RailHeader;
