"use client";

import BookmarkButton from "@/components/ui/button/BookmarkButton";
import ShareButton from "@/components/ui/button/ShareButton";
import { useCoverArtTheme } from "@/components/ui/theme/CoverThemeProvider";
import Trailer from "@/components/ui/overlay/Trailer";
import { SavedMovieDetails } from "@/types/movie";
import { getImageUrl, movieDurationString, mutateMovieTitle, mutateTvShowTitle } from "@/utils/movies";
import Link from "next/link";
import { FaPlay } from "react-icons/fa6";
import { IoListOutline } from "react-icons/io5";

interface DetailHeroBillboardProps {
  media: any;
  type: "movie" | "tv";
  onViewEpisodesClick?: () => void;
}

const DetailHeroBillboard: React.FC<DetailHeroBillboardProps> = ({
  media,
  type,
  onViewEpisodesClick,
}) => {
  const isTv = type === "tv";
  const title = isTv ? mutateTvShowTitle(media) : mutateMovieTitle(media);
  const releaseDate = media.release_date || media.first_air_date;
  const releaseYear = releaseDate ? new Date(releaseDate).getFullYear() : 2025;
  const playHref = isTv ? `/watch/tv/${media.id}/1/1` : `/watch/movie/${media.id}`;
  const bgUrl = getImageUrl(media.backdrop_path || media.images?.backdrops?.[0]?.file_path, "backdrop", true);

  const voteAverage = media.vote_average || 8.2;
  const matchPercentage = Math.min(99, Math.round(voteAverage * 10 + 8));

  const bookmarkData: SavedMovieDetails = {
    type: isTv ? "tv" : "movie",
    adult: media.adult || false,
    backdrop_path: media.backdrop_path,
    id: media.id,
    poster_path: media.poster_path,
    release_date: releaseDate || "",
    title,
    vote_average: media.vote_average,
    saved_date: new Date().toISOString(),
  };

  // The detail page takes its colour from this title's own artwork.
  useCoverArtTheme([bgUrl, getImageUrl(media.poster_path)], bgUrl);

  const runtimeText = !isTv && media.runtime ? movieDurationString(media.runtime) : null;
  const seasonsText = isTv && media.number_of_seasons ? `${media.number_of_seasons} Season${media.number_of_seasons > 1 ? "s" : ""}` : null;
  const videos = media.videos?.results || [];

  return (
    <div className="sf-hero group relative h-[56dvh] min-h-[380px] max-h-[520px] sm:h-[62dvh] sm:min-h-[440px] sm:max-h-[600px] lg:h-[68dvh] lg:min-h-[500px] lg:max-h-[720px] w-full select-none overflow-hidden bg-black/30">
      {/* Background Backdrop: Edge-to-Edge Cinematic Brilliance */}
      <img
        src={bgUrl}
        alt={title}
        className="absolute inset-0 size-full object-cover object-center sm:object-top filter brightness-100 contrast-[1.03] saturate-[1.05] pointer-events-none"
        draggable={false}
      />

      {/* Cinematic Vignette Gradients */}
      {/* Bottom smooth fade to content section */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-linear-to-t from-black/95 via-black/45 to-transparent sm:h-48 md:h-56" />
      {/* Top subtle navbar blend */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-14 bg-linear-to-b from-black/25 to-transparent" />

      {/* Hero Content Block */}
      <div className="absolute inset-x-4 bottom-6 z-20 mx-auto flex max-w-xl flex-col items-center gap-2 text-center sm:bottom-8 sm:gap-2.5 md:bottom-10 md:gap-3 lg:bottom-14 lg:max-w-2xl">
        {/* Title */}
        <h1 className="line-clamp-2 text-lg leading-tight font-bold tracking-tight text-white drop-shadow-[0_4px_14px_rgba(0,0,0,0.95)] sm:text-2xl md:text-3xl lg:text-4xl">
          {title}
        </h1>

        {/* Tagline if available */}
        {media.tagline && (
          <p className="text-xs sm:text-sm font-semibold italic text-gray-300 drop-shadow-sm line-clamp-1">
            &ldquo;{media.tagline}&rdquo;
          </p>
        )}

        {/* Metadata Badges */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 text-[11px] sm:gap-2 md:gap-3 sm:text-xs md:text-sm">
          <span className="font-semibold text-[var(--sf-accent)] drop-shadow-sm">
            {matchPercentage}% Match
          </span>
          <span className="font-medium text-gray-300">{releaseYear}</span>
          <span className="sf-chip !py-0.5 !text-[10px] tracking-[0.14em] uppercase">
            {media.adult ? "18+" : "16+"}
          </span>
          {runtimeText && <span className="sf-chip !py-0.5 !text-[10px]">{runtimeText}</span>}
          {seasonsText && <span className="sf-chip !py-0.5 !text-[10px]">{seasonsText}</span>}
        </div>

        {/* Genres Pills */}
        {media.genres && media.genres.length > 0 && (
          <div className="hidden flex-wrap justify-center gap-1.5 pt-0.5 sm:flex">
            {media.genres.slice(0, 3).map((g: any) => (
              <span
                key={g.id}
                className="text-[11px] text-gray-200 font-medium bg-black/50 px-2.5 py-0.5 rounded-full border border-white/10"
              >
                {g.name}
              </span>
            ))}
          </div>
        )}

        {/* Overview / Synopsis */}
        <p className="max-w-lg text-xs leading-relaxed text-gray-200/90 line-clamp-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] sm:text-sm sm:line-clamp-3 md:text-base">
          {media.overview || "Stream this title now exclusively on SnapFlix."}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1 sm:gap-3 sm:pt-2">
          {/* Main Play Button */}
          <Link
            href={playHref}
            className="group/btn flex items-center gap-1.5 sm:gap-2.5 rounded-md bg-white px-4 sm:px-6 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base font-bold text-black shadow-lg transition-all duration-200 hover:bg-white/80 active:scale-95"
          >
            <FaPlay className="text-xs sm:text-sm md:text-base transition-transform group-hover/btn:scale-110" />
            <span>Play</span>
          </Link>

          {/* Episodes Jump Button (For TV Series) */}
          {isTv && onViewEpisodesClick && (
            <button
              type="button"
              onClick={onViewEpisodesClick}
              className="flex items-center gap-1.5 sm:gap-2 rounded-md bg-white/20 backdrop-blur-md px-3.5 sm:px-5 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base font-semibold text-white transition-all duration-200 hover:bg-white/30 active:scale-95 border border-white/15 cursor-pointer"
            >
              <IoListOutline size={18} className="sm:size-[20px]" />
              <span>Episodes</span>
            </button>
          )}

          {/* Trailer Modal Button */}
          {videos.length > 0 && (
            <div className="scale-95 sm:scale-100">
              <Trailer videos={videos} />
            </div>
          )}

          {/* Bookmark / My List */}
          <div className="scale-95 sm:scale-105">
            <BookmarkButton data={bookmarkData} />
          </div>

          {/* Share Modal Button */}
          <div className="scale-95 sm:scale-100">
            <ShareButton id={media.id} title={title} type={type} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailHeroBillboard;
