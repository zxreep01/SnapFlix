"use client";

import Carousel from "@/components/ui/wrapper/Carousel";
import Reveal from "@/components/ui/other/Reveal";
import { tmdb } from "@/api/tmdb";
import { getImageUrl, mutateMovieTitle, mutateTvShowTitle } from "@/utils/movies";
import { cn } from "@/utils/helpers";
import { Skeleton, Tooltip } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { FaPlay } from "react-icons/fa6";
import { ChevronRight } from "@/utils/icons";
import HoverPosterCard from "../Movie/Cards/Hover";
import TvShowHoverCard from "../TV/Cards/Hover";
import useBreakpoints from "@/hooks/useBreakpoints";
import useDiscoverFilters from "@/hooks/useDiscoverFilters";
import { MOCK_MOVIES, MOCK_TV_SHOWS } from "@/utils/mockData";

interface Top10RowProps {
  contentType?: "movie" | "tv";
}

const Top10Row: React.FC<Top10RowProps> = ({ contentType: propContentType }) => {
  const { content: filterContent } = useDiscoverFilters();
  const currentContent = filterContent || propContentType || "movie";
  const isTv = currentContent === "tv";
  const { mobile } = useBreakpoints();

  const { data, isPending } = useQuery({
    queryKey: ["top10-ranking", currentContent],
    queryFn: async () => {
      try {
        if (isTv) {
          const res = await tmdb.trending.trending("tv", "day");
          if (res?.results?.length > 0) return res;
        } else {
          const res = await tmdb.trending.trending("movie", "day");
          if (res?.results?.length > 0) return res;
        }
      } catch (err) {
        console.warn("TMDB error in Top 10, using fallback:", err);
      }
      return {
        results: isTv ? MOCK_TV_SHOWS.slice(0, 10) : MOCK_MOVIES.slice(0, 10),
      };
    },
    staleTime: 1000 * 60 * 30,
  });

  const top10 =
    data?.results && data.results.length > 0
      ? data.results.slice(0, 10)
      : isTv
        ? MOCK_TV_SHOWS.slice(0, 10)
        : MOCK_MOVIES.slice(0, 10);

  return (
    <section className="flex min-h-[210px] flex-col gap-2">
      {/* Centred marquee board instead of a plain heading */}
      <div className="flex items-center justify-center px-4 sm:px-5 md:px-8">
        <Link
          href={`/discover?type=todayTrending${isTv ? "&content=tv" : ""}`}
          className="group min-w-0"
          aria-label="Browse the Top 10 today"
        >
          <span className="sf-board">
            <span className="sf-bulb" aria-hidden />
            <span className="sf-board-title transition-colors group-hover:text-white">
              Top 10
            </span>
            <ChevronRight className="size-3 shrink-0 text-white/40 transition-transform duration-500 ease-sf group-hover:translate-x-0.5" />
          </span>
        </Link>
      </div>

      {isPending && top10.length === 0 ? (
        <div className="sf-no-scrollbar flex gap-4 overflow-hidden px-4 sm:px-5 md:px-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-24 w-10 rounded-sf opacity-20" />
              <Skeleton className="aspect-square w-[104px] rounded-sf opacity-30 sm:w-[124px] md:w-[140px]" />
            </div>
          ))}
        </div>
      ) : (
        <Reveal className="px-4 sm:px-5 md:px-8">
          <Carousel>
            {top10.map((item, index) => {
              const rank = index + 1;
              const title = isTv ? mutateTvShowTitle(item as any) : mutateMovieTitle(item as any);
              const posterUrl = getImageUrl(item.poster_path);
              const href = isTv ? `/tv/${item.id}` : `/movie/${item.id}`;

              return (
                <div key={item.id} className="embla__slide flex min-w-fit items-center py-3 pr-3">
                  <Tooltip
                    isDisabled={mobile}
                    showArrow
                    className="border border-white/10 bg-secondary-background p-0"
                    shadow="lg"
                    delay={800}
                    placement="right-start"
                    content={
                      isTv ? (
                        <TvShowHoverCard id={item.id} />
                      ) : (
                        <HoverPosterCard id={item.id} />
                      )
                    }
                  >
                    <Link
                      href={href}
                      className="group relative flex items-end transition-transform duration-300 ease-out hover:scale-105 active:scale-95"
                    >
                      {/* Netflix Stylized Giant Ranking Number */}
                      <span
                        className={cn(
                          "netflix-number pointer-events-none z-0 -mr-2 text-[52px] leading-none select-none sm:-mr-2.5 sm:text-[64px] md:text-[76px]",
                        )}
                        style={{
                          WebkitTextStroke: "2px var(--sf-accent)",
                          color: "transparent",
                        }}
                      >
                        {rank}
                      </span>

                      {/* Poster Card */}
                      <div className="sf-case relative z-10 w-[104px] shadow-2xl sm:w-[124px] md:w-[140px]">
                        <div className="sf-case-face">
                          {/* Rank ribbon, kept on the case edge */}
                          <div className="absolute top-1.5 right-1.5 z-20 rounded-full bg-[var(--sf-accent)] px-1.5 py-0.5 text-[8px] font-bold tracking-[0.14em] text-[var(--sf-on-accent)] uppercase shadow-[0_0_14px_var(--sf-glow-soft)]">
                            Top 10
                          </div>

                          <img
                            src={posterUrl}
                            alt={title}
                            className="absolute inset-0 size-full object-cover object-center transition-transform duration-700 ease-sf group-hover:scale-[1.05]"
                            loading="lazy"
                            decoding="async"
                          />

                          <span className="sf-case-spine" />
                          <span className="sf-case-gloss" />
                          <span className="sf-case-sheen" />

                          <div className="absolute inset-0 z-10 bg-linear-to-t from-black/85 via-transparent to-transparent" />

                          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/35 opacity-0 backdrop-blur-xs transition-opacity duration-500 group-hover:opacity-100">
                            <div className="flex size-8 items-center justify-center rounded-full bg-[var(--sf-accent)] text-[var(--sf-on-accent)] shadow-[0_0_16px_var(--sf-glow)] transition-transform duration-500 ease-sf group-hover:scale-105">
                              <FaPlay className="ml-0.5 text-[10px]" />
                            </div>
                          </div>

                          <div className="absolute inset-x-0 bottom-0 z-20 p-2">
                            <p className="truncate text-[11px] font-semibold text-white drop-shadow-md">
                              {title}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </Tooltip>
                </div>
              );
            })}
          </Carousel>
        </Reveal>
      )}
    </section>
  );
};

export default Top10Row;
