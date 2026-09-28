"use client";

import Link from "next/link";
import { cn } from "@/utils/helpers";
import { useId } from "react";

export interface BrandLogoProps {
  animate?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
  align?: "left" | "center";
}

const BrandLogo: React.FC<BrandLogoProps> = ({
  className,
  size = "md",
  align = "center",
}) => {
  const rawId = useId();
  const id = rawId.replace(/[^a-zA-Z0-9_-]/g, "");
  const pathId = `netflix-arch-${id}`;
  const filterId = `netflix-glow-${id}`;

  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex items-center transition-transform duration-300 hover:scale-105 active:scale-95 shrink-0 select-none",
        className,
      )}
      aria-label="SnapFlix Home"
    >
      {/* Netflix-style Arched Curved Wordmark SNAPFLIX (No preceding logo icon) */}
      <svg
        viewBox={align === "left" ? "20 0 140 38" : "0 0 180 38"}
        className={cn(
          "w-auto select-none overflow-visible text-[var(--sf-accent)] transition-colors duration-700",
          size === "sm" && "h-7 sm:h-8",
          size === "md" && "h-8 sm:h-9 md:h-10",
          size === "lg" && "h-10 sm:h-12",
        )}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Netflix Signature Upward Arc Baseline */}
          <path id={pathId} d="M 4,30 Q 90,20 176,30" fill="none" />
          <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="currentColor" floodOpacity="0.45" />
          </filter>
        </defs>
        {/* The wordmark inherits the cover-art accent through `currentColor` */}
        <text
          fill="currentColor"
          fontWeight="700"
          fontSize="21"
          letterSpacing="1.1"
          filter={`url(#${filterId})`}
          className="transition-all duration-300 group-hover:brightness-110"
          style={{ fontFamily: "var(--font-display)" }}
        >
          <textPath href={`#${pathId}`} startOffset="50%" textAnchor="middle">
            SNAPFLIX
          </textPath>
        </text>
      </svg>
    </Link>
  );
};

export default BrandLogo;
