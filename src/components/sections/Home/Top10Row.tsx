"use client";

import Carousel from "@/components/ui/wrapper/Carousel";
import RailHeader from "@/components/ui/other/RailHeader";
import Reveal from "@/components/ui/other/Reveal";
import { tmdb } from "@/api/tmdb";
import { getImageUrl, mutateMovieTitle, mutateTvShowTitle } from "@/utils/movies";
import { cn } from "@/utils/helpers";
import { Skeleton, Tooltip } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { FaPlay } from "react-icons/fa6";
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
      {/* Row heading, matching the rails */}
      <div className="flex items-center gap-2 px-4 md:px-12">
        <RailHeader
          title={`Top 10 in ${isTv ? "Series" : "Films"} Today`}
          href={`/discover?type=todayTrending${isTv ? "&content=tv" : ""}`}
        />
      </div>

      {isPending && top10.length === 0 ? (
        <div className="sf-no-scrollbar flex gap-4 overflow-hidden px-4 md:px-12">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-end gap-2">
              <Skeleton className="h-24 w-9 rounded-sf opacity-20" />
              <Skeleton className="aspect-[2/3] w-[124px] rounded-sf opacity-30 md:w-[150px]" />
            </div>
          ))}
        </div>
      ) : (
        <Reveal className="px-4 md:px-12">
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
                      className="group relative flex items-end transition-transform duration-300 ease-out hover:scale-[1.03] active:scale-95"
                    >
                      {/* Giant ranking numeral, half behind the poster */}
                      <span className="netflix-number pointer-events-none z-0 -mr-4 text-[68px] leading-[0.75] select-none sm:-mr-5 sm:text-[86px] md:text-[104px]">
                        {rank}
                      </span>

                      {/* Poster */}
                      <div className="relative z-10 w-[124px] shrink-0 md:w-[150px]">
                        <div className="nf-poster">
                          <img
                            src={posterUrl}
                            alt={title}
                            loading="lazy"
                            decoding="async"
                          />

                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="flex size-9 scale-90 items-center justify-center rounded-full border border-white/60 bg-black/40 opacity-0 transition-all duration-300 ease-sf group-hover:scale-100 group-hover:opacity-100">
                              <FaPlay className="ml-0.5 text-[11px] text-white" />
                            </span>
                          </div>
                        </div>

                        <p className="mt-2 truncate text-[13px] font-medium text-white/85">
                          {title}
                        </p>
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
