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
      className="group block w-[268px] shrink-0 sm:w-[300px] lg:w-[336px]"
    >
      <div
        className={cn(
          "relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-black/40",
          "transition-all duration-300 group-hover:border-[color:var(--sf-hairline)] group-hover:shadow-[0_18px_40px_rgba(0,0,0,0.55)]",
        )}
      >
        <img
          src={posterImage}
          alt={media.title}
          className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/25 to-transparent" />

        {/* Badges */}
        <div className="absolute inset-x-2.5 top-2.5 flex items-start justify-between gap-2">
          <span className="sf-chip !px-2 !py-0.5 !text-[10px] font-bold">
            {media.completed ? "Completed" : `${formatDuration(media.last_position)} watched`}
          </span>
          {media.type === "tv" && (
            <span className="sf-chip sf-chip-accent !px-2 !py-0.5 !text-[10px] font-bold">
              S{media.season} E{media.episode}
            </span>
          )}
        </div>

        {/* Play affordance */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="flex size-11 items-center justify-center rounded-full bg-white/15 opacity-0 backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:opacity-100">
            <PlayFilled className="size-4 text-white" />
          </span>
        </div>

        {/* Copy */}
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-3">
          <h6 className="truncate text-sm font-bold text-white">{media.title}</h6>
          <div className="flex items-center justify-between gap-2 text-[11px] text-white/60">
            <span className="truncate">{releaseYear}</span>
            <span className="shrink-0">{timeAgo(media.updated_at)}</span>
          </div>
        </div>

        {/* Progress bar in the artwork accent */}
        <div className="absolute inset-x-0 bottom-0 h-1 bg-white/15">
          <div
            className="h-full rounded-r-full bg-[var(--sf-accent)] shadow-[0_0_12px_var(--sf-glow)]"
            style={{ width: `${completion}%` }}
          />
        </div>
      </div>
    </Link>
  );
};

export default ResumeCard;
