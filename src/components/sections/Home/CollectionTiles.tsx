"use client";

import { siteConfig } from "@/config/site";
import { cn } from "@/utils/helpers";
import {
  Calendar,
  Clock,
  Compass,
  Like,
  Play,
  Rocket,
  Season,
  Star,
} from "@/utils/icons";
import Link from "next/link";
import { useMemo } from "react";

interface CollectionTilesProps {
  contentType: "movie" | "tv";
  className?: string;
}

/**
 * Rounded "app tile" row, borrowed from the reference layout's service strip.
 *
 * Every tile is a catalogue collection instead of a third-party brand, and all
 * tiles share the artwork hue (each one only shifts in lightness) so the row
 * always reads as one theme.
 */
const CollectionTiles: React.FC<CollectionTilesProps> = ({ contentType, className }) => {
  const collections = useMemo(() => {
    const { movies, tvShows } = siteConfig.queryLists;

    const iconFor = (param: string) => {
      const map: Record<string, React.ReactNode> = {
        todayTrending: <Rocket className="size-[26px]" />,
        thisWeekTrending: <Clock className="size-[26px]" />,
        popular: <Like className="size-[26px]" />,
        nowPlaying: <Play className="size-[26px]" />,
        upcoming: <Calendar className="size-[26px]" />,
        topRated: <Star className="size-[26px]" />,
        onTheAir: <Season className="size-[26px]" />,
      };
      return map[param] ?? <Star className="size-[26px]" />;
    };

    const list = (contentType === "tv" ? tvShows : movies).slice(0, 6).map((item) => ({
      key: item.param,
      label: item.name.replace(/(Movies|TV Shows)/g, "").trim(),
      href: `/discover?type=${item.param}${contentType === "tv" ? "&content=tv" : ""}`,
      icon: iconFor(item.param),
    }));

    return [
      ...list,
      {
        key: "discover",
        label: "Discover",
        href: `/discover${contentType === "tv" ? "?content=tv" : ""}`,
        icon: <Compass className="size-[26px]" />,
      },
    ];
  }, [contentType]);

  return (
    <div className={cn("flex w-full flex-col gap-2.5", className)}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="truncate text-sm font-bold tracking-wide text-white/90 sm:text-base">
          Browse collections
        </h2>
        <span className="hidden shrink-0 text-[11px] font-medium text-white/45 sm:block">
          {contentType === "tv" ? "Series curated daily" : "Films curated daily"}
        </span>
      </div>

      <div className="sf-no-scrollbar -mx-1 flex gap-3 overflow-x-auto px-1 pb-1 sm:gap-4">
        {collections.map((collection, index) => (
          <Link
            key={collection.key}
            href={collection.href}
            className="group flex w-[68px] shrink-0 flex-col items-center gap-2 sm:w-[76px]"
            aria-label={`Browse ${collection.label}`}
          >
            <span
              className="sf-tile flex size-[62px] items-center justify-center text-white sm:size-[68px]"
              style={{ background: `var(--sf-tile-${index % 7})` }}
            >
              <span className="transition-transform duration-300 group-hover:scale-110">
                {collection.icon}
              </span>
            </span>
            <span className="w-full truncate text-center text-[10px] font-semibold text-white/60 transition-colors group-hover:text-white sm:text-[11px]">
              {collection.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CollectionTiles;
