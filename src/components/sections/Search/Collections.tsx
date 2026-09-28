"use client";

import { siteConfig } from "@/config/site";
import { cn } from "@/utils/helpers";
import { Calendar, Clock, Compass, Like, Play, Rocket, Season, Star } from "@/utils/icons";
import Link from "next/link";
import Reveal from "@/components/ui/other/Reveal";
import { useMemo } from "react";

interface CollectionsProps {
  className?: string;
}

/**
 * Catalogue collections, shown on the search surface when nothing is typed.
 *
 * Every tile is a discovery shortcut and all of them share the artwork hue
 * (each one only shifts in lightness), so the row always reads as one theme.
 */
const Collections: React.FC<CollectionsProps> = ({ className }) => {
  const collections = useMemo(() => {
    const { movies } = siteConfig.queryLists;

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

    const list = movies.slice(0, 6).map((item) => ({
      key: item.param,
      label: item.name.replace(/(Movies|TV Shows)/g, "").trim(),
      href: `/discover?type=${item.param}`,
      icon: iconFor(item.param),
    }));

    return [
      ...list,
      {
        key: "discover",
        label: "Discover",
        href: "/discover",
        icon: <Compass className="size-4" />,
      },
    ];
  }, []);

  return (
    <Reveal className={cn("flex w-full flex-col items-center gap-3", className)}>
      <span className="sf-board min-w-0">
        <span className="sf-bulb" aria-hidden />
        <span className="sf-board-title">Collections</span>
      </span>

      <div className="flex w-full flex-wrap items-start justify-center gap-2.5 sm:gap-3">
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

export default Collections;
