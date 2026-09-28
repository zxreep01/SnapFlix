"use client";

import { useCoverTheme } from "@/components/ui/theme/CoverThemeProvider";
import VaulDrawer from "@/components/ui/overlay/VaulDrawer";
import useBreakpoints from "@/hooks/useBreakpoints";
import useDeviceVibration from "@/hooks/useDeviceVibration";
import { PlayFilled } from "@/utils/icons";
import { getImageUrl, mutateTvShowTitle } from "@/utils/movies";
import { Tooltip } from "@heroui/react";
import { useDisclosure } from "@mantine/hooks";
import Link from "next/link";
import { useCallback } from "react";
import { TV } from "tmdb-ts/dist/types";
import { useLongPress } from "use-long-press";
import TvShowHoverCard from "./Hover";

interface TvShowPosterCardProps {
  tv: TV;
  variant?: "full" | "bordered";
}

/**
 * Poster tile for series rails and grids — the TV counterpart of
 * {@link MoviePosterCard}, sharing the same thumbnails, sizing and theming.
 */
const TvShowPosterCard: React.FC<TvShowPosterCardProps> = ({ tv, variant = "full" }) => {
  const [opened, handlers] = useDisclosure(false);
  const posterImage = getImageUrl(tv.poster_path);
  const title = mutateTvShowTitle(tv);
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
        content={<TvShowHoverCard id={tv.id} />}
      >
        <Link
          href={`/tv/${tv.id}`}
          {...longPress()}
          onMouseEnter={() =>
            setFocusTheme([
              getImageUrl(tv.backdrop_path, "backdrop", true),
              getImageUrl(tv.poster_path),
            ])
          }
          onMouseLeave={clearFocusTheme}
        >
          {variant === "full" ? (
            <div className="group w-[190px] shrink-0 sm:w-[220px] md:w-[248px] lg:w-[280px]">
              <div className="nf-thumb">
                <img src={posterImage} alt={title} loading="lazy" decoding="async" />

                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="flex size-9 scale-90 items-center justify-center rounded-full border border-white/60 bg-black/40 opacity-0 transition-all duration-300 ease-sf group-hover:scale-100 group-hover:opacity-100">
                    <PlayFilled className="size-3.5 text-white" />
                  </span>
                </span>

                {tv.adult && (
                  <span className="absolute top-1.5 left-1.5 rounded-sf bg-black/70 px-1.5 py-0.5 text-[9px] font-medium text-white/85">
                    18+
                  </span>
                )}
              </div>

              <p className="mt-2 truncate text-[13px] font-medium text-white/85">{title}</p>
            </div>
          ) : (
            <div className="group flex h-full flex-col">
              <div className="nf-poster">
                <img src={posterImage} alt={title} loading="lazy" decoding="async" />

                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="flex size-9 scale-90 items-center justify-center rounded-full border border-white/60 bg-black/40 opacity-0 transition-all duration-300 ease-sf group-hover:scale-100 group-hover:opacity-100">
                    <PlayFilled className="size-3.5 text-white" />
                  </span>
                </span>

                {tv.adult && (
                  <span className="absolute top-1.5 left-1.5 rounded-sf bg-black/70 px-1.5 py-0.5 text-[9px] font-medium text-white/85">
                    18+
                  </span>
                )}
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
          <TvShowHoverCard id={tv.id} fullWidth />
        </VaulDrawer>
      )}
    </>
  );
};

export default TvShowPosterCard;
