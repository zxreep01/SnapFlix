"use client";

import { cn } from "@/utils/helpers";
import { ChevronRight } from "@/utils/icons";
import Link from "next/link";

interface RailHeaderProps {
  title: string;
  href: string;
  className?: string;
}

/**
 * Shared heading for every content rail, shaped like an old cinema board: a
 * rounded plaque with a marquee bulb strip and the title letter-spaced inside
 * it. The whole board is the link, so the chevron is the only extra mark.
 */
const RailHeader: React.FC<RailHeaderProps> = ({ title, href, className }) => (
  <div className={cn("flex min-w-0 items-center justify-center", className)}>
    <Link href={href} className="group min-w-0" aria-label={`Browse ${title}`}>
      <span className="sf-board">
        <span className="sf-bulb" aria-hidden />
        <span className="sf-board-title transition-colors group-hover:text-white">{title}</span>
        <ChevronRight className="size-3 shrink-0 text-white/40 transition-transform duration-500 ease-sf group-hover:translate-x-0.5" />
      </span>
    </Link>
  </div>
);

export default RailHeader;
