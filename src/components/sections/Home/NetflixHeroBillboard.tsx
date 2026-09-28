"use client";

import { tmdb } from "@/api/tmdb";
import BookmarkButton from "@/components/ui/button/BookmarkButton";
import { useCoverArtTheme, useCoverTheme } from "@/components/ui/theme/CoverThemeProvider";
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

/** TMDB genre ids are stable, so the hero can label slides without a request. */
const GENRE_NAMES: Record<number, string> = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Sci-Fi",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
  10759: "Action & Adventure",
  10762: "Kids",
  10763: "News",
  10764: "Reality",
  10765: "Sci-Fi & Fantasy",
  10766: "Soap",
  10767: "Talk",
  10768: "War & Politics",
};

const NetflixHeroBillboard: React.FC<NetflixHeroBillboardProps> = ({
  contentType: propContentType,
}) => {
  const searchParams = useSearchParams();
  const currentContent = propContentType || searchParams.get("content") || "movie";
  const isTv = currentContent === "tv";

  const [currentIndex, setCurrentIndex] = useState(0);
  const { clearFocusTheme, setFocusTheme } = useCoverTheme();

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

  const activeGenres: string[] = (activeItem?.genre_ids ?? [])
    .map((id: number) => GENRE_NAMES[id])
    .filter(Boolean)
    .slice(0, 3);

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
        className="sf-hero h-[54dvh] max-h-[620px] min-h-[380px] sm:h-[58dvh] lg:h-[62dvh] lg:min-h-[440px] 2xl:h-[68dvh]"
        ref={emblaRef}
      >
        {/* Infinite Scroll Track */}
        <div className="flex size-full touch-pan-y">
          {heroItems.map((item: any, idx: number) => {
            const title = isTv ? mutateTvShowTitle(item as any) : mutateMovieTitle(item as any);
            const bgUrl = getImageUrl(item.backdrop_path, "backdrop", true);
            const isActive = idx === currentIndex;

            return (
              <div key={item.id || idx} className="relative size-full flex-none overflow-hidden">
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
                <div className="absolute inset-0 bg-linear-to-r from-black/85 via-black/45 to-transparent" />
                <div className="absolute inset-x-0 top-0 h-24 bg-linear-to-b from-black/55 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-black/90 via-black/45 to-transparent sm:h-48" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Slide Content — single overlay so text never duplicates during the loop */}
      <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-end">
        <div className="flex w-full flex-col gap-3 px-4 pb-6 sm:gap-4 sm:px-6 md:px-9 md:pb-8 lg:pb-10">
          <div className="pointer-events-auto flex max-w-[min(46rem,94%)] flex-col gap-2.5 sm:gap-3">
            {/* Brand + rank badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5">
                <span className="flex h-4 w-3.5 items-center justify-center rounded-xs bg-[var(--sf-accent)] text-[9px] font-black text-[var(--sf-on-accent)] sm:h-5 sm:w-4 sm:text-[11px]">
                  S
                </span>
                <span className="text-[10px] font-extrabold tracking-[0.2em] text-white/90 uppercase sm:text-xs">
                  {isTv ? "SnapFlix Original Series" : "SnapFlix Feature Film"}
                </span>
              </span>
              <span className="sf-chip sf-chip-accent !py-0.5 text-[10px] uppercase">
                Top {currentIndex + 1}
              </span>
            </div>

            {/* Title — clamped and clamped again so long names never overflow */}
            <h1
              title={activeTitle}
              className="sf-clamp-2 text-[clamp(1.55rem,4.4vw,3.5rem)] leading-[1.05] font-black tracking-tight text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.85)]"
            >
              {activeTitle}
            </h1>

            {/* Metadata chips */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="sf-chip !text-[10px] font-bold text-[var(--sf-accent)] sm:!text-xs">
                {activeMatch}% Match
              </span>
              <span className="sf-chip !text-[10px] sm:!text-xs">{activeYear}</span>
              <span className="sf-chip !text-[10px] sm:!text-xs">
                {activeItem?.adult ? "18+" : "16+"}
              </span>
              {activeRuntime && (
                <span className="sf-chip hidden !text-xs sm:inline-flex">{activeRuntime}</span>
              )}
              {isTv && (
                <span className="sf-chip hidden !text-xs sm:inline-flex">
                  {activeItem?.number_of_seasons
                    ? `${activeItem.number_of_seasons} Season${activeItem.number_of_seasons > 1 ? "s" : ""}`
                    : "Series"}
                </span>
              )}
              {activeGenres.map((genre) => (
                <span key={genre} className="sf-chip hidden !text-xs md:inline-flex">
                  {genre}
                </span>
              ))}
              <span className="sf-chip hidden !text-xs lg:inline-flex">Ultra HD · Subtitles</span>
            </div>

            {/* Synopsis — clamped to two lines, hidden on the smallest screens */}
            {activeItem?.overview && (
              <p className="sf-clamp-2 hidden max-w-xl text-sm text-white/70 sm:block">
                {activeItem.overview}
              </p>
            )}

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2 pt-0.5 sm:gap-2.5">
              <Link
                href={
                  isTv ? `/watch/tv/${activeItem.id}/1/1` : `/watch/movie/${activeItem.id}`
                }
                className="flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-black transition-transform hover:scale-[1.03] active:scale-95 sm:px-6"
              >
                <PlayFilled className="size-3.5" />
                Play
              </Link>
              <Link
                href={isTv ? `/tv/${activeItem.id}` : `/movie/${activeItem.id}`}
                className="sf-glass flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/20 sm:px-5"
              >
                <Info className="size-4" />
                More Info
              </Link>
              {bookmarkData && (
                <span className="sf-glass flex size-10 items-center justify-center rounded-full">
                  <BookmarkButton data={bookmarkData} isTooltipDisabled />
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Slide indicators + queue preview */}
      <div className="absolute inset-x-0 bottom-0 z-30 flex items-end justify-between gap-3 px-4 pb-3 sm:px-6 md:px-9">
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
                  "h-1.5 cursor-pointer rounded-full transition-all duration-300",
                  isCurrent
                    ? "w-7 bg-[var(--sf-accent)] shadow-[0_0_10px_var(--sf-glow)]"
                    : "w-3 bg-white/35 hover:bg-white/70",
                )}
              />
            );
          })}
        </div>
      </div>

      {/* Next-up poster card, mirroring the reference's layered artwork */}
      {heroItems.length > 1 && (
        <button
          type="button"
          onMouseEnter={() => {
            const next = heroItems[(currentIndex + 1) % heroItems.length];
            if (next) {
              setFocusTheme([
                getImageUrl(next.backdrop_path, "backdrop", true),
                getImageUrl(next.poster_path),
              ]);
            }
          }}
          onMouseLeave={clearFocusTheme}
          onClick={() => handleSlideClick((currentIndex + 1) % heroItems.length)}
          className="absolute right-4 bottom-6 z-30 hidden w-[132px] shrink-0 overflow-hidden rounded-2xl border border-white/15 bg-black/40 text-left shadow-[0_16px_40px_rgba(0,0,0,0.6)] backdrop-blur-md transition-transform hover:-translate-y-1 lg:w-[150px] xl:block"
          aria-label="Play next slide"
        >
          <img
            src={getImageUrl(heroItems[(currentIndex + 1) % heroItems.length]?.poster_path)}
            alt=""
            className="aspect-2/3 w-full object-cover opacity-90"
            draggable={false}
          />
          <span className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/90 to-transparent px-2.5 pt-6 pb-2 text-[10px] font-bold text-white">
            Up next
          </span>
        </button>
      )}
    </section>
  );
};

/** Loading placeholder that mirrors the hero's final layout. */
const HeroSkeleton = () => (
  <div className="sf-hero relative flex h-[54dvh] max-h-[620px] min-h-[380px] w-full flex-col justify-end overflow-hidden bg-black/40 sm:h-[58dvh] lg:h-[62dvh] 2xl:h-[68dvh]">
    <Skeleton className="absolute inset-0 size-full rounded-none opacity-20" />
    <div className="relative z-10 flex flex-col gap-3 px-4 pb-8 sm:px-6 md:px-9">
      <Skeleton className="h-4 w-40 rounded-full opacity-30" />
      <Skeleton className="h-10 w-[min(24rem,80%)] rounded-lg opacity-40 sm:h-14" />
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-6 w-20 rounded-full opacity-30" />
        <Skeleton className="h-6 w-14 rounded-full opacity-30" />
        <Skeleton className="h-6 w-16 rounded-full opacity-30" />
      </div>
      <div className="flex gap-2 pt-1">
        <Skeleton className="h-10 w-24 rounded-full opacity-40" />
        <Skeleton className="h-10 w-32 rounded-full opacity-30" />
      </div>
    </div>
  </div>
);

export default NetflixHeroBillboard;
