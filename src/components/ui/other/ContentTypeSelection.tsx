"use client";

import useDiscoverFilters from "@/hooks/useDiscoverFilters";
import { ContentType } from "@/types";
import { cn } from "@/utils/helpers";
import { Compass } from "@/utils/icons";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface ContentTypeSelectionProps {
  onTypeChange?: (type: ContentType) => void;
  /** Hides the "New & Popular" shortcut on surfaces that only switch media type. */
  withDiscover?: boolean;
  className?: string;
}

/**
 * Segmented pill switcher for the catalogue.
 *
 * Replaces the older tab list so the control matches the reference layout: a
 * frosted pill containing the options, with the active one filled by the
 * current cover-art accent.
 */
const ContentTypeSelection: React.FC<ContentTypeSelectionProps> = ({
  onTypeChange,
  withDiscover = true,
  className,
}) => {
  const pathName = usePathname();
  const { content, setContent, resetFilters } = useDiscoverFilters();

  const handleTabChange = (key: ContentType) => {
    if (key === content) return;
    resetFilters();
    setContent(key);
    onTypeChange?.(key);
  };

  const options: { key: ContentType; label: string }[] = [
    { key: "movie", label: "Movies" },
    { key: "tv", label: "TV Series" },
  ];

  return (
    <div
      role="tablist"
      aria-label="Content type"
      className={cn(
        "flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-white/10 bg-white/[0.06] p-1 backdrop-blur-xl sf-no-scrollbar",
        className,
      )}
    >
      {options.map((option) => {
        const isActive = content === option.key;
        return (
          <button
            key={option.key}
            role="tab"
            type="button"
            aria-selected={isActive}
            onClick={() => handleTabChange(option.key)}
            className={cn(
              "shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-300 sm:px-5 sm:text-sm",
              isActive
                ? "bg-[var(--sf-accent)] text-[var(--sf-on-accent)] shadow-[0_0_20px_var(--sf-glow-soft)]"
                : "text-white/70 hover:bg-white/10 hover:text-white",
            )}
          >
            {option.label}
          </button>
        );
      })}

      {withDiscover && (
        <Link
          href="/discover"
          className={cn(
            "flex shrink-0 items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-300 sm:px-5 sm:text-sm",
            pathName === "/discover"
              ? "bg-[var(--sf-accent)] text-[var(--sf-on-accent)] shadow-[0_0_20px_var(--sf-glow-soft)]"
              : "text-white/70 hover:bg-white/10 hover:text-white",
          )}
        >
          <Compass className="size-3.5" />
          New &amp; Popular
        </Link>
      )}
    </div>
  );
};

export default ContentTypeSelection;
