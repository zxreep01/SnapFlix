"use client";

import { useCoverTheme } from "@/components/ui/theme/CoverThemeProvider";
import VaulDrawer from "@/components/ui/overlay/VaulDrawer";
import useBreakpoints from "@/hooks/useBreakpoints";
import useDeviceVibration from "@/hooks/useDeviceVibration";
import { cn } from "@/utils/helpers";
import { PlayFilled } from "@/utils/icons";
import { getImageUrl, mutateMovieTitle } from "@/utils/movies";
import { Tooltip } from "@heroui/react";
import { useDisclosure } from "@mantine/hooks";
import Link from "next/link";
import { useCallback } from "react";
import { Movie } from "tmdb-ts/dist/types";
import { useLongPress } from "use-long-press";
import HoverPosterCard from "./Hover";

interface MoviePosterCardProps {
  movie: Movie;
  variant?: "full" | "bordered";
}

/**
 * Poster tile for movie rails and grids.
 *
 * The artwork sits inside a square CD jewel case — spine, gloss and a slow
 * sheen sweep — with the title and year on a quiet label underneath, so rails
 * and grids keep one ratio whatever the source posters look like.
 */
const MoviePosterCard: React.FC<MoviePosterCardProps> = ({ movie, variant = "full" }) => {
  const [opened, handlers] = useDisclosure(false);
  const releaseDate = movie.release_date ? new Date(movie.release_date) : null;
  const releaseYear = releaseDate?.getFullYear() ?? new Date().getFullYear();
  const posterImage = getImageUrl(movie.poster_path);
  const title = mutateMovieTitle(movie);
  const { mobile } = useBreakpoints();
  const { startVibration } = useDeviceVibration();
  const { setFocusTheme, clearFocusTheme } = useCoverTheme();

  const callback = useCallback(() => {
    handlers.open();
    setTimeout(() => startVibration([100]), 300);
  }, []);

  const longPress = useLongPress(mobile ? callback : null, {
    cancelOnMovement: true,
    threshold: 300,
  });

  return (
    <>
      <Tooltip
        isDisabled={mobile}
        showArrow
        className="bg-secondary-background p-0"
        shadow="lg"
        delay={1000}
        placement="right-start"
        content={<HoverPosterCard id={movie.id} />}
      >
        <Link
          href={`/movie/${movie.id}`}
          {...longPress()}
          onMouseEnter={() =>
            setFocusTheme([
              getImageUrl(movie.backdrop_path, "backdrop", true),
              getImageUrl(movie.poster_path),
            ])
          }
          onMouseLeave={clearFocusTheme}
        >
          {variant === "full" && (
            <div className="group w-[112px] shrink-0 text-white sm:w-[124px] md:w-[132px] lg:w-[144px]">
              <div className="sf-case transition-transform duration-500 ease-sf group-hover:-translate-y-1">
                <div className="sf-case-face">
                  <img
                    src={posterImage}
                    alt={title}
                    className="absolute inset-0 size-full object-cover object-center transition-transform duration-700 ease-sf group-hover:scale-[1.05]"
                    loading="lazy"
                    decoding="async"
                  />
                  <span className="sf-case-spine" />
                  <span className="sf-case-gloss" />
                  <span className="sf-case-sheen" />
                
                  {movie.adult && (
                    <span className="absolute top-1.5 left-1.5 rounded-full bg-black/60 px-1.5 py-0.5 text-[8px] font-bold tracking-wide text-white/80 uppercase backdrop-blur-md">
                      18+
                    </span>
                  )}
                
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="flex size-9 scale-90 items-center justify-center rounded-full bg-[var(--sf-accent)] text-[var(--sf-on-accent)] opacity-0 shadow-[0_0_18px_var(--sf-glow)] transition-all duration-500 ease-sf group-hover:scale-100 group-hover:opacity-100">
                      <PlayFilled className="size-3.5" />
                    </span>
                  </span>
                </div>
              </div>

              {/* Shelf label under the case keeps every row aligned */}
              <div className="mt-2 flex items-center justify-between gap-2 px-0.5">
                <p className="truncate text-[11px] font-medium text-white/85">{title}</p>
                <span className="shrink-0 text-[10px] text-white/40">{releaseYear}</span>
              </div>
            </div>
          )}

          {variant === "bordered" && (
            <div className="group flex h-full flex-col gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-2.5 transition-colors hover:border-[color:var(--sf-hairline)]">
              <div className="sf-case w-full transition-transform duration-500 ease-sf group-hover:-translate-y-1">
                <div className="sf-case-face">
                  <img
                    src={posterImage}
                    alt={title}
                    className="absolute inset-0 size-full object-cover object-center transition-transform duration-700 ease-sf group-hover:scale-[1.05]"
                    loading="lazy"
                    decoding="async"
                  />
                  <span className="sf-case-spine" />
                  <span className="sf-case-gloss" />
                  <span className="sf-case-sheen" />
                
                  {movie.adult && (
                    <span className="absolute top-1.5 left-1.5 rounded-full bg-black/60 px-1.5 py-0.5 text-[8px] font-bold tracking-wide text-white/80 uppercase backdrop-blur-md">
                      18+
                    </span>
                  )}
                
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="flex size-9 scale-90 items-center justify-center rounded-full bg-[var(--sf-accent)] text-[var(--sf-on-accent)] opacity-0 shadow-[0_0_18px_var(--sf-glow)] transition-all duration-500 ease-sf group-hover:scale-100 group-hover:opacity-100">
                      <PlayFilled className="size-3.5" />
                    </span>
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-0.5 px-0.5">
                <p className="truncate text-xs font-medium text-white/90">{title}</p>
                <p className="text-[10px] text-white/40">{releaseYear}</p>
              </div>
            </div>
          )}
        </Link>
      </Tooltip>

      {mobile && (
        <VaulDrawer
          backdrop="blur"
          open={opened}
          onOpenChange={handlers.toggle}
          title={title}
          hiddenTitle
        >
          <HoverPosterCard id={movie.id} fullWidth />
        </VaulDrawer>
      )}
    </>
  );
};
export default MoviePosterCard;
