"use client";

import { useCoverTheme } from "@/components/ui/theme/CoverThemeProvider";
import type { HistoryDetail } from "@/types/movie";
import { cn } from "@/utils/helpers";
import { PlayFilled } from "@/utils/icons";
import { formatDuration, getImageUrl, timeAgo } from "@/utils/movies";
import Link from "next/link";
import { useCallback } from "react";

interface ResumeCardProps {
  media: HistoryDetail;
}

/**
 * Wide resume card for the "Continue Watching" rail.
 *
 * Progress is painted with the current cover-art accent, so the rail keeps
 * matching whatever artwork is on screen.
 */
const ResumeCard: React.FC<ResumeCardProps> = ({ media }) => {
  const { setFocusTheme, clearFocusTheme } = useCoverTheme();
  const releaseYear = new Date(media.release_date).getFullYear();
  const posterImage = getImageUrl(media.backdrop_path || media.poster_path || "");
  const completion = media.duration > 0 ? Math.min(100, (media.last_position / media.duration) * 100) : 0;

  const getRedirectLink = useCallback(() => {
    if (media.type === "movie") {
      return `/watch/movie/${media.media_id}`;
    }
    if (media.type === "tv") {
      return `/watch/tv/${media.media_id}/${media.season}/${media.episode}`;
    }
    return "/";
  }, [media]);

  return (
    <Link
      href={getRedirectLink()}
      onMouseEnter={() =>
        setFocusTheme([
          getImageUrl(media.backdrop_path || undefined, "backdrop", true),
          getImageUrl(media.poster_path || undefined),
        ])
      }
      onMouseLeave={clearFocusTheme}
      className="group block w-[228px] shrink-0 sm:w-[264px] lg:w-[300px]"
    >
      <div
        className={cn(
          "relative aspect-video overflow-hidden rounded-sf bg-[#2f2f2f]",
          "transition-transform duration-300 ease-sf group-hover:scale-[1.03]",
        )}
      >
        <img
          src={posterImage}
          alt={media.title}
          className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/25 to-transparent" />

        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />

        {/* Play affordance */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="flex size-11 items-center justify-center rounded-full border border-white/60 bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <PlayFilled className="size-4 text-white" />
          </span>
        </div>

        {/* Copy */}
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-2.5">
          <h6 className="truncate text-[13px] font-medium text-white">{media.title}</h6>
          <div className="flex items-center gap-2 text-[11px] text-white/60">
            <span className="truncate">{releaseYear}</span>
            <span className="shrink-0">{timeAgo(media.updated_at)}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="absolute inset-x-0 bottom-0 h-[3px] bg-white/25">
          <div className="h-full bg-[var(--sf-accent)]" style={{ width: `${completion}%` }} />
        </div>
      </div>
    </Link>
  );
};

export default ResumeCard;
