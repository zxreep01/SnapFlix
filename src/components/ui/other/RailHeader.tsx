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
 * Netflix row heading: the title in plain white, with the "Explore All" link
 * that fades in next to it while the row is hovered or focused.
 */
const RailHeader: React.FC<RailHeaderProps> = ({ title, href, className }) => (
  <div className={cn("group flex min-w-0 items-center gap-2", className)}>
    <Link href={href} className="nf-row-title truncate hover:text-white">
      {title}
    </Link>

    <Link
      href={href}
      aria-label={`Explore all ${title}`}
      className="flex shrink-0 items-center gap-0.5 text-[11px] font-medium text-white/0 transition-colors duration-300 ease-sf group-hover:text-white/55 focus-visible:text-white/55 md:text-xs"
    >
      Explore All
      <ChevronRight className="size-2.5" />
    </Link>
  </div>
);

export default RailHeader;
