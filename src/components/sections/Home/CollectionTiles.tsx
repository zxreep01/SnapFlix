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
import Reveal from "@/components/ui/other/Reveal";
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
        todayTrending: <Rocket className="size-4" />,
        thisWeekTrending: <Clock className="size-4" />,
        popular: <Like className="size-4" />,
        nowPlaying: <Play className="size-4" />,
        upcoming: <Calendar className="size-4" />,
        topRated: <Star className="size-4" />,
        onTheAir: <Season className="size-4" />,
      };
      return map[param] ?? <Star className="size-4" />;
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
        icon: <Compass className="size-4" />,
      },
    ];
  }, [contentType]);

  return (
    <Reveal className={cn("flex w-full flex-col gap-2", className)}>
      <div className="flex items-center justify-between gap-3">
        <span className="sf-board min-w-0">
          <span className="sf-bulb" aria-hidden />
          <span className="sf-board-title">Collections</span>
        </span>
        <span className="hidden shrink-0 text-[10px] tracking-[0.12em] text-white/35 uppercase sm:block">
          {contentType === "tv" ? "Series curated daily" : "Films curated daily"}
        </span>
      </div>

      <div className="sf-no-scrollbar -mx-1 flex gap-2.5 overflow-x-auto px-1 pb-1 sm:gap-3">
        {collections.map((collection, index) => (
          <Link
            key={collection.key}
            href={collection.href}
            className="group flex w-[58px] shrink-0 flex-col items-center gap-1.5 sm:w-[64px]"
            aria-label={`Browse ${collection.label}`}
          >
            <span
              className="sf-tile flex size-[46px] items-center justify-center text-white/85 sm:size-[50px]"
              style={{ background: `var(--sf-tile-${index % 7})` }}
            >
              <span className="transition-transform duration-500 ease-sf group-hover:scale-105">
                {collection.icon}
              </span>
            </span>
            <span className="w-full truncate text-center text-[10px] font-semibold text-white/60 transition-colors group-hover:text-white sm:text-[11px]">
              {collection.label}
            </span>
          </Link>
        ))}
      </div>
    </Reveal>
  );
};

export default CollectionTiles;
