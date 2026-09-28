"use client";

import { tmdb } from "@/api/tmdb";
import BookmarkButton from "@/components/ui/button/BookmarkButton";
import { useCoverArtTheme } from "@/components/ui/theme/CoverThemeProvider";
import { SavedMovieDetails } from "@/types/movie";
import { MOCK_MOVIES, MOCK_TV_SHOWS } from "@/utils/mockData";
import { getImageUrl, movieDurationString, mutateMovieTitle, mutateTvShowTitle } from "@/utils/movies";
import { cn } from "@/utils/helpers";
import { Info, PlayFilled } from "@/utils/icons";
import { Skeleton } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import useEmblaCarousel from "embla-carousel-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

interface NetflixHeroBillboardProps {
  contentType?: "movie" | "tv";
}

const SLIDE_INTERVAL_MS = 3000; // 3 seconds infinite auto scroll

const NetflixHeroBillboard: React.FC<NetflixHeroBillboardProps> = ({
  contentType: propContentType,
}) => {
  const searchParams = useSearchParams();
  const currentContent = propContentType || searchParams.get("content") || "movie";
  const isTv = currentContent === "tv";

  const [currentIndex, setCurrentIndex] = useState(0);

  // Embla Carousel with true seamless Infinite Loop
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    duration: 30,
    skipSnaps: false,
  });

  const { data, isPending } = useQuery({
    queryKey: ["hero-billboard-trending", currentContent],
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
        console.warn("TMDB fetch error in billboard, using top trending fallback:", err);
      }
      return {
        page: 1,
        results: isTv ? MOCK_TV_SHOWS : MOCK_MOVIES,
        total_pages: 1,
        total_results: 10,
      };
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  // Extract top 4 trending titles
  const heroItems = useMemo(() => {
    const rawList =
      data?.results && data.results.length > 0 ? data.results : isTv ? MOCK_TV_SHOWS : MOCK_MOVIES;
    const withBackdrop = rawList.filter((item: any) => Boolean(item.backdrop_path));
    if (withBackdrop.length >= 4) {
      return withBackdrop.slice(0, 4);
    }
    const fallbackList = isTv ? MOCK_TV_SHOWS : MOCK_MOVIES;
    const combined = [...withBackdrop];
    for (const item of fallbackList) {
      if (combined.length >= 4) break;
      if (!combined.some((c: any) => c.id === item.id)) {
        combined.push(item);
      }
    }
    return combined.slice(0, 4);
  }, [data, isTv]);

  const activeItem: any = heroItems[currentIndex] ?? heroItems[0];

  // The whole interface takes its colour from the artwork currently on screen.
  useCoverArtTheme(
    activeItem
      ? [getImageUrl(activeItem.backdrop_path, "backdrop", true), getImageUrl(activeItem.poster_path)]
      : null,
    activeItem ? getImageUrl(activeItem.backdrop_path, "backdrop", true) : null,
  );

  // Sync selected index with Embla scroll events
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCurrentIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  // Reset to first slide when switching between Movies and TV
  useEffect(() => {
    if (emblaApi) {
      emblaApi.scrollTo(0, true);
      setCurrentIndex(0);
    }
  }, [currentContent, emblaApi]);

  // Automatic Infinite Scroll Every 3 Seconds
  useEffect(() => {
    if (!emblaApi || heroItems.length <= 1) return;

    const interval = setInterval(() => {
      emblaApi.scrollNext();
    }, SLIDE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [emblaApi, heroItems.length, currentIndex]);

  const handleSlideClick = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi],
  );

  const activeTitle = activeItem
    ? isTv
      ? mutateTvShowTitle(activeItem as any)
      : mutateMovieTitle(activeItem as any)
    : "";

  const activeRelease = activeItem?.release_date || activeItem?.first_air_date;
  const activeYear = activeRelease ? new Date(activeRelease).getFullYear() : 2025;
  const activeMatch = Math.min(99, Math.round((activeItem?.vote_average || 8.2) * 10 + 8));
  const activeRuntime =
    !isTv && activeItem?.runtime ? movieDurationString(activeItem.runtime) : null;

  const bookmarkData: SavedMovieDetails | null = activeItem
    ? {
        type: isTv ? "tv" : "movie",
        adult: activeItem.adult || false,
        backdrop_path: activeItem.backdrop_path,
        id: activeItem.id,
        poster_path: activeItem.poster_path,
        release_date: activeRelease || "",
        title: activeTitle,
        vote_average: activeItem.vote_average,
        saved_date: new Date().toISOString(),
      }
    : null;

  if (isPending && (!heroItems || heroItems.length === 0)) {
    return <HeroSkeleton />;
  }

  if (!heroItems || heroItems.length === 0) return null;

  return (
    <section
      aria-label="Featured titles"
      className="relative w-full select-none overflow-hidden bg-black/20"
    >
      {/* Infinite Scroll Viewport */}
      <div
        className="sf-hero h-[56dvh] max-h-[640px] min-h-[380px] sm:h-[62dvh] lg:h-[70dvh] lg:min-h-[460px] 2xl:h-[76dvh]"
        ref={emblaRef}
      >
        {/* Infinite Scroll Track */}
        <div className="flex size-full touch-pan-y">
          {heroItems.map((item: any, idx: number) => {
            const title = isTv ? mutateTvShowTitle(item as any) : mutateMovieTitle(item as any);
            const bgUrl = getImageUrl(item.backdrop_path, "backdrop", true);
            const isActive = idx === currentIndex;

            return (
              <div
                key={item.id || idx}
                data-active={isActive}
                className="sf-frame relative size-full flex-none overflow-hidden"
              >
                {/* Artwork — the colour source for the entire interface */}
                <img
                  src={bgUrl}
                  alt={title}
                  className={cn(
                    "absolute inset-0 size-full object-cover object-center transition-transform duration-[6000ms] ease-out",
                    isActive ? "scale-[1.03]" : "scale-100",
                  )}
                  draggable={false}
                />

                {/* Cinematic vignettes keep copy legible over any artwork */}
                <div className="absolute inset-0 bg-linear-to-r from-black/85 via-black/40 to-transparent" />
                <div className="absolute inset-x-0 top-0 h-20 bg-linear-to-b from-black/50 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-black/90 via-black/45 to-transparent sm:h-48" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Slide Content — single overlay so text never duplicates during the loop */}
      <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-end">
        <div className="flex w-full flex-col px-4 pb-14 sm:px-6 md:px-12 md:pb-20">
          <div className="pointer-events-auto flex max-w-[min(36rem,90%)] flex-col gap-3 text-left md:gap-4">
            {/* Title */}
            <h1
              title={activeTitle}
              className="sf-clamp-2 text-[clamp(1.5rem,3.4vw,3rem)] leading-[1.05] font-bold tracking-tight text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.85)]"
            >
              {activeTitle}
            </h1>

            {/* Metadata, separated by dots like the Netflix billboard */}
            <div className="nf-meta">
              <span className="font-medium text-[var(--sf-accent)]">{activeMatch}% Match</span>
              <span>{activeYear}</span>
              <span>{activeItem?.adult ? "18+" : "16+"}</span>
              {activeRuntime && <span>{activeRuntime}</span>}
              {isTv && activeItem?.number_of_seasons && (
                <span>
                  {activeItem.number_of_seasons} Season
                  {activeItem.number_of_seasons > 1 ? "s" : ""}
                </span>
              )}
            </div>

            {/* Synopsis — clamped to the small screens out of the way */}
            {activeItem?.overview && (
              <p className="sf-clamp-2 hidden max-w-lg text-[13px] leading-snug text-white/85 drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)] sm:block md:text-sm">
                {activeItem.overview}
              </p>
            )}

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2 pt-1 md:gap-3">
              <Link
                href={
                  isTv ? `/watch/tv/${activeItem.id}/1/1` : `/watch/movie/${activeItem.id}`
                }
                className="nf-btn nf-btn-play"
              >
                <PlayFilled className="size-4" />
                Play
              </Link>
              <Link
                href={isTv ? `/tv/${activeItem.id}` : `/movie/${activeItem.id}`}
                className="nf-btn nf-btn-ghost"
              >
                <Info className="size-4" />
                More Info
              </Link>
              {bookmarkData && (
                <span className="nf-btn nf-btn-icon">
                  <BookmarkButton data={bookmarkData} isTooltipDisabled />
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Slide indicators, centred the way Netflix stacks its billboards */}
      <div className="absolute inset-x-0 bottom-5 z-30 flex items-end justify-center gap-3 px-4">
        <div className="flex items-center gap-2">
          {heroItems.map((_, idx) => {
            const isCurrent = idx === currentIndex;
            return (
              <button
                key={`hero-dot-${idx}`}
                type="button"
                onClick={() => handleSlideClick(idx)}
                aria-label={`Show slide ${idx + 1}`}
                aria-current={isCurrent}
                className={cn(
                  "size-2 cursor-pointer rounded-full transition-colors duration-300",
                  isCurrent ? "bg-white" : "bg-white/35 hover:bg-white/70",
                )}
              />
            );
          })}
        </div>
      </div>

    </section>
  );
};

/** Loading placeholder that mirrors the hero's final layout. */
const HeroSkeleton = () => (
  <div className="sf-hero relative flex h-[56dvh] max-h-[640px] min-h-[380px] w-full flex-col justify-end overflow-hidden bg-[#181818] sm:h-[62dvh] lg:h-[70dvh] 2xl:h-[76dvh]">
    <Skeleton className="absolute inset-0 size-full rounded-sf opacity-20" />
    <div className="relative z-10 flex flex-col gap-3 px-4 pb-20 sm:px-6 md:px-12">
      <Skeleton className="h-8 w-[min(22rem,70%)] rounded-sf opacity-40 sm:h-12" />
      <Skeleton className="h-4 w-52 rounded-sf opacity-30" />
      <div className="flex gap-2 pt-1">
        <Skeleton className="h-10 w-28 rounded-sf opacity-40" />
        <Skeleton className="h-10 w-32 rounded-sf opacity-30" />
      </div>
    </div>
  </div>
);

export default NetflixHeroBillboard;
