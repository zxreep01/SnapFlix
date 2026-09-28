"use client";

import { tmdb } from "@/api/tmdb";
import { useCoverTheme } from "@/components/ui/theme/CoverThemeProvider";
import { MOCK_MOVIES, MOCK_TV_SHOWS } from "@/utils/mockData";
import { cn } from "@/utils/helpers";
import { getImageUrl, mutateMovieTitle, mutateTvShowTitle } from "@/utils/movies";
import { PlayFilled } from "@/utils/icons";
import Reveal from "@/components/ui/other/Reveal";
import { Skeleton } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo } from "react";

interface FeaturedSplitProps {
  contentType: "movie" | "tv";
}

/**
 * Two-column feature block from the reference layout: a narrow "Recent" column
 * with stacked wide cards next to a wider "Recommended For You" poster row.
 *
 * Hovering any card previews that title's cover-art palette, so the interface
 * recolours before the viewer even opens it.
 */
const FeaturedSplit: React.FC<FeaturedSplitProps> = ({ contentType }) => {
  const isTv = contentType === "tv";
  const { setFocusTheme, clearFocusTheme } = useCoverTheme();

  const { data, isPending } = useQuery({
    queryKey: ["home-featured-split", contentType],
    queryFn: async () => {
      try {
        const res = isTv ? await tmdb.trending.trending("tv", "week") : await tmdb.movies.popular();
        if (res?.results?.length > 0) return res;
      } catch (err) {
        console.warn("TMDB error in featured split, using local catalog:", err);
      }
      return {
        page: 1,
        results: isTv ? MOCK_TV_SHOWS : MOCK_MOVIES,
        total_pages: 1,
        total_results: 10,
      };
    },
    staleTime: 1000 * 60 * 30,
  });

  const items = useMemo(() => {
    const list = data?.results?.length ? data.results : isTv ? MOCK_TV_SHOWS : MOCK_MOVIES;
    return list.slice(0, 6);
  }, [data, isTv]);

  /** Artwork URLs used for the hover preview. */
  const sourcesFor = (item: any) => [
    getImageUrl(item.backdrop_path, "backdrop", true),
    getImageUrl(item.poster_path),
  ];

  const recent = items.slice(0, 2);
  const recommended = items.slice(2, 6);

  // Headings stay mounted while data loads so the layout never jumps.
  if (isPending) {
    return (
      <div className="mx-auto grid w-full max-w-[1600px] grid-cols-1 gap-6 px-4 sm:px-5 md:px-8 lg:grid-cols-[minmax(190px,240px)_1fr] lg:gap-8">
        <div className="flex flex-col gap-3">
          <span className="sf-board">
            <span className="sf-bulb" aria-hidden />
            <span className="sf-board-title">Recent</span>
          </span>
          <Skeleton className="aspect-video rounded-sf opacity-25" />
          <Skeleton className="aspect-video rounded-sf opacity-25" />
        </div>
        <div className="flex flex-col gap-3">
          <span className="sf-board">
            <span className="sf-bulb" aria-hidden />
            <span className="sf-board-title">Recommended</span>
          </span>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="aspect-square rounded-sf opacity-25" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto grid w-full max-w-[1600px] grid-cols-1 gap-6 px-4 sm:px-5 md:px-8 lg:grid-cols-[minmax(190px,240px)_1fr] lg:gap-8">
      {/* Recent — stacked wide cards */}
      <div className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-2">
          <span className="sf-board min-w-0">
            <span className="sf-bulb" aria-hidden />
            <span className="sf-board-title">Recent</span>
          </span>
          <span className="shrink-0 text-[10px] font-medium tracking-[0.12em] text-[var(--sf-accent)] uppercase">
            Just added
          </span>
        </div>

        <div className="flex flex-col gap-3">
          {recent.map((item: any) => {
            const title = isTv ? mutateTvShowTitle(item) : mutateMovieTitle(item);
            const href = isTv ? `/tv/${item.id}` : `/movie/${item.id}`;
            const playHref = isTv ? `/watch/tv/${item.id}/1/1` : `/watch/movie/${item.id}`;
            const date = item.release_date || item.first_air_date;

            return (
              <div
                key={item.id}
                onMouseEnter={() => setFocusTheme(sourcesFor(item))}
                onMouseLeave={clearFocusTheme}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/40"
              >
                <Link href={href} className="block">
                  <img
                    src={getImageUrl(item.backdrop_path, "backdrop")}
                    alt={title}
                    className="aspect-video w-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/25 to-transparent" />

                  <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-2.5">
                    <p className="truncate text-[11px] font-semibold text-white sm:text-xs">{title}</p>
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-[10px] text-white/60">
                        {date ? new Date(date).getFullYear() : "New"}
                      </span>
                      <span className="sf-chip !px-2 !py-0 !text-[9px] uppercase">
                        {isTv ? "Series" : "Film"}
                      </span>
                    </div>
                  </div>
                </Link>

                <Link
                  href={playHref}
                  aria-label={`Play ${title}`}
                  className="absolute top-2 right-2 flex size-8 items-center justify-center rounded-full bg-[var(--sf-accent)] text-[var(--sf-on-accent)] opacity-0 shadow-[0_0_16px_var(--sf-glow)] transition-opacity group-hover:opacity-100"
                >
                  <PlayFilled className="size-3" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommended For You — poster row */}
      <div className="flex min-w-0 flex-col gap-3">
        <div className="flex items-baseline justify-between gap-2">
          <span className="sf-board min-w-0">
            <span className="sf-bulb" aria-hidden />
            <span className="sf-board-title">Recommended</span>
          </span>
          <Link
            href={`/discover${isTv ? "?content=tv" : ""}`}
            className="shrink-0 text-[11px] font-semibold text-white/55 transition-colors hover:text-white"
          >
            See all
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {recommended.map((item: any) => {
            const title = isTv ? mutateTvShowTitle(item) : mutateMovieTitle(item);
            const href = isTv ? `/tv/${item.id}` : `/movie/${item.id}`;
            const date = item.release_date || item.first_air_date;

            return (
              <Link
                key={item.id}
                href={href}
                onMouseEnter={() => setFocusTheme(sourcesFor(item))}
                onMouseLeave={clearFocusTheme}
                className={cn(
                  "group relative overflow-hidden rounded-2xl border border-white/10 bg-black/40",
                  "transition-all duration-300 hover:border-[color:var(--sf-hairline)] hover:shadow-[0_14px_36px_rgba(0,0,0,0.55)]",
                )}
              >
                <img
                  src={getImageUrl(item.poster_path)}
                  alt={title}
                  className="aspect-square w-full object-cover transition-transform duration-700 ease-sf group-hover:scale-[1.05]"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/85 via-transparent to-transparent" />

                {/* Corner date chip, mirroring the reference cards */}
                <span className="absolute top-2 right-2 rounded-md bg-black/55 px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-white/85 backdrop-blur-md">
                  {date ? new Date(date).toISOString().slice(0, 10).replace(/-/g, ".") : "NEW"}
                </span>

                <span className="absolute inset-x-0 bottom-0 truncate p-2.5 text-[11px] font-semibold text-white">
                  {title}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FeaturedSplit;
