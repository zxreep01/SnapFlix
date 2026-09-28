"use client";

import { useCoverTheme } from "@/components/ui/theme/CoverThemeProvider";
import VaulDrawer from "@/components/ui/overlay/VaulDrawer";
import useBreakpoints from "@/hooks/useBreakpoints";
import useDeviceVibration from "@/hooks/useDeviceVibration";
import { cn } from "@/utils/helpers";
import { PlayFilled } from "@/utils/icons";
import { getImageUrl, mutateMovieTitle } from "@/utils/movies";
import { Card, CardBody, CardFooter, CardHeader, Chip, Image, Tooltip } from "@heroui/react";
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
 * Sized by width (never height) so a rail can never overflow its panel, with a
 * dated chip in the corner and a hover state painted in the cover-art accent.
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
            <div
              className={cn(
                "group relative w-[136px] shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-black/40 text-white sm:w-[148px] md:w-[156px] lg:w-[168px]",
                "transition-all duration-300 hover:-translate-y-1 hover:border-[color:var(--sf-hairline)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.55)]",
              )}
            >
              <div className="relative aspect-2/3 w-full">
                <img
                  src={posterImage}
                  alt={title}
                  className="absolute inset-0 size-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />

                <div className="absolute inset-0 bg-linear-to-t from-black/90 via-transparent to-transparent" />

                {/* Date chip, mirroring the reference tiles */}
                <span className="absolute top-2 right-2 rounded-md bg-black/55 px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-white/85 backdrop-blur-md">
                  {releaseDate
                    ? releaseDate.toISOString().slice(0, 10).replace(/-/g, ".")
                    : "NEW"}
                </span>

                {movie.adult && (
                  <span className="absolute top-2 left-2 rounded-md bg-danger px-1.5 py-0.5 text-[9px] font-black text-white uppercase">
                    18+
                  </span>
                )}

                {/* Play affordance */}
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="flex size-10 scale-90 items-center justify-center rounded-full bg-[var(--sf-accent)] text-[var(--sf-on-accent)] opacity-0 shadow-[0_0_18px_var(--sf-glow)] transition-all duration-300 group-hover:scale-100 group-hover:opacity-100">
                    <PlayFilled className="size-3.5" />
                  </span>
                </span>

                <div className="absolute inset-x-0 bottom-0 flex flex-col gap-0.5 p-2.5">
                  <h6 className="truncate text-xs font-bold sm:text-sm">{title}</h6>
                  <p className="truncate text-[10px] text-white/60">{releaseYear}</p>
                </div>
              </div>
            </div>
          )}

          {variant === "bordered" && (
            <Card
              isHoverable
              fullWidth
              shadow="md"
              className="group h-full border border-white/10 bg-secondary-background"
            >
              <CardHeader className="flex items-center justify-center pb-0">
                <div className="relative size-full">
                  {movie.adult && (
                    <Chip
                      color="danger"
                      size="sm"
                      variant="shadow"
                      className="absolute top-2 left-2 z-20"
                    >
                      18+
                    </Chip>
                  )}
                  <div className="relative overflow-hidden rounded-2xl">
                    <Image
                      isBlurred
                      alt={title}
                      className="aspect-2/3 rounded-2xl object-cover object-center group-hover:scale-105"
                      src={posterImage}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardBody className="justify-end pb-1">
                <p className="truncate text-sm font-bold">{title}</p>
              </CardBody>
              <CardFooter className="justify-between pt-0 text-xs">
                <p>{releaseYear}</p>
              </CardFooter>
            </Card>
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
