"use client";

import { tmdb } from "@/api/tmdb";
import MoviePosterCard from "@/components/sections/Movie/Cards/Poster";
import TvShowPosterCard from "@/components/sections/TV/Cards/Poster";
import Loop from "@/components/ui/other/Loop";
import PosterCardSkeleton from "@/components/ui/other/PosterCardSkeleton";
import Reveal from "@/components/ui/other/Reveal";
import { MOCK_MOVIES, MOCK_TV_SHOWS } from "@/utils/mockData";
import { useDebouncedValue } from "@mantine/hooks";
import { useEffect, useMemo, useState } from "react";
import { IoClose, IoSearchOutline } from "react-icons/io5";
import { Movie, TV } from "tmdb-ts/dist/types";
import Collections from "./Collections";

/**
 * Search surface.
 *
 * One centred field sits on top of either the catalogue collections (while the
 * field is idle) or the matching titles, laid out as the same CD-case grid the
 * rest of the catalogue uses.
 */
const SearchIndex: React.FC = () => {
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebouncedValue(query, 250);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [shows, setShows] = useState<TV[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const trimmed = debouncedQuery.trim();

    if (trimmed.length < 2) {
      setMovies([]);
      setShows([]);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    const searchCatalog = async () => {
      let movieResults: Movie[] = [];
      let showResults: TV[] = [];

      try {
        const [moviesRes, tvRes] = await Promise.allSettled([
          tmdb.search.movies({ query: trimmed, page: 1 }),
          tmdb.search.tvShows({ query: trimmed, page: 1 }),
        ]);

        if (moviesRes.status === "fulfilled") movieResults = moviesRes.value?.results ?? [];
        if (tvRes.status === "fulfilled") showResults = tvRes.value?.results ?? [];
      } catch (err) {
        console.warn("TMDB search error, using the local catalog:", err);
      }

      // Offline or empty API response — keep the grid usable from the catalog.
      if (movieResults.length === 0 && showResults.length === 0) {
        const q = trimmed.toLowerCase();
        movieResults = MOCK_MOVIES.filter(
          (movie) =>
            movie.title.toLowerCase().includes(q) || movie.overview?.toLowerCase().includes(q),
        ) as unknown as Movie[];
        showResults = MOCK_TV_SHOWS.filter(
          (show) => show.name.toLowerCase().includes(q) || show.overview?.toLowerCase().includes(q),
        ) as unknown as TV[];
      }

      if (!isMounted) return;
      setMovies(movieResults);
      setShows(showResults);
      setIsLoading(false);
    };

    searchCatalog();

    return () => {
      isMounted = false;
    };
  }, [debouncedQuery]);

  const hasQuery = query.trim().length > 1;
  const hasResults = useMemo(() => movies.length > 0 || shows.length > 0, [movies, shows]);

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col items-center gap-6 px-4 pt-6 pb-16 sm:px-5 md:px-8">
      {/* Centred search field */}
      <div className="flex w-full max-w-xl items-center gap-2.5 rounded-full border border-white/12 bg-white/[0.05] px-4 py-2.5 backdrop-blur-xl transition-[border-color,box-shadow] duration-500 ease-sf focus-within:border-[color:var(--sf-accent)] focus-within:shadow-[0_0_28px_var(--sf-glow-soft)]">
        <IoSearchOutline className="size-4 shrink-0 text-white/50" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search movies and series"
          aria-label="Search movies and series"
          className="w-full bg-transparent text-sm text-white placeholder-white/35 outline-hidden"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="shrink-0 text-white/45 transition-colors hover:text-white"
          >
            <IoClose className="size-4" />
          </button>
        )}
      </div>

      {/* Idle: browse the catalogue collections */}
      {!hasQuery && <Collections />}

      {hasQuery && (
        <div className="w-full">
          {isLoading ? (
            <div className="movie-grid">
              <Loop count={14} prefix="SkeletonSearchPoster">
                <PosterCardSkeleton variant="bordered" />
              </Loop>
            </div>
          ) : hasResults ? (
            <Reveal className="movie-grid">
              {movies.map((movie) => (
                <MoviePosterCard
                  key={`movie-${movie.id}`}
                  movie={movie as any}
                  variant="bordered"
                />
              ))}
              {shows.map((show) => (
                <TvShowPosterCard key={`tv-${show.id}`} tv={show as any} variant="bordered" />
              ))}
            </Reveal>
          ) : (
            <p className="py-10 text-center text-xs text-white/45">No matches. Try another title.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchIndex;
