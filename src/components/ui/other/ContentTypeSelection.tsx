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
        "sf-no-scrollbar flex max-w-full items-center gap-0.5 overflow-x-auto rounded-sf border border-white/25 bg-black p-0.5",
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
              "shrink-0 rounded-[3px] px-3.5 py-1.5 text-[13px] transition-colors duration-300 ease-sf",
              isActive ? "bg-white font-medium text-black" : "text-white/70 hover:text-white",
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
            "flex shrink-0 items-center gap-1.5 rounded-[3px] px-3.5 py-1.5 text-[13px] transition-colors duration-300 ease-sf",
            pathName === "/discover"
              ? "bg-white font-medium text-black"
              : "text-white/70 hover:text-white",
          )}
        >
          <Compass className="size-3" />
          New &amp; Popular
        </Link>
      )}
    </div>
  );
};

export default ContentTypeSelection;
