"use client";

import { tmdb } from "@/api/tmdb";
import useBreakpoints from "@/hooks/useBreakpoints";
import { cn } from "@/utils/helpers";
import { MOCK_MOVIES, MOCK_TV_SHOWS } from "@/utils/mockData";
import { getImageUrl } from "@/utils/movies";
import { useClickOutside, useDebouncedValue } from "@mantine/hooks";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FaPlay, FaStar } from "react-icons/fa6";
import { IoClose, IoInformationCircleOutline, IoSearchOutline } from "react-icons/io5";

export interface SearchResultItem {
  id: number;
  title: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  vote_average?: number;
  media_type: "movie" | "tv";
  overview?: string;
}

interface NavSearchProps {
  /**
   * `bar` renders the compact pill used by the mobile top bar, while `rail`
   * renders the icon button that expands out of the desktop icon rail.
   */
  variant?: "bar" | "rail";
}

const NavSearch: React.FC<NavSearchProps> = ({ variant = "bar" }) => {
  const { mobile } = useBreakpoints();
  const rail = variant === "rail";
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebouncedValue(query, 250);
  const [activeFilter, setActiveFilter] = useState<"all" | "movie" | "tv">("all");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setQuery("");
    setResults([]);
  }, []);

  // Click outside listener closes the search bar and floating list
  const containerRef = useClickOutside(() => {
    if (isOpen) handleClose();
  });

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Global ESC key and Ctrl+K listener.
  // Only the instance matching the current breakpoint reacts, so the mobile
  // and desktop search never open the hidden one.
  useEffect(() => {
    const isActiveVariant = rail ? !mobile : mobile;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isActiveVariant) return;
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose, mobile, rail]);

  // Reset the field when the layout swaps between the bar and the rail.
  useEffect(() => {
    handleClose();
  }, [mobile, handleClose]);

  // Fetch search results whenever debouncedQuery changes
  useEffect(() => {
    const trimmed = debouncedQuery.trim();
    if (!trimmed) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    const searchCatalog = async () => {
      let combinedResults: SearchResultItem[] = [];

      try {
        const [moviesRes, tvRes] = await Promise.allSettled([
          tmdb.search.movies({ query: trimmed, page: 1 }),
          tmdb.search.tvShows({ query: trimmed, page: 1 }),
        ]);

        const moviesList: SearchResultItem[] =
          moviesRes.status === "fulfilled" && moviesRes.value?.results
            ? moviesRes.value.results.map((m) => ({
                id: m.id,
                title: m.title,
                poster_path: m.poster_path,
                backdrop_path: m.backdrop_path,
                release_date: m.release_date,
                vote_average: m.vote_average,
                media_type: "movie" as const,
                overview: m.overview,
              }))
            : [];

        const tvList: SearchResultItem[] =
          tvRes.status === "fulfilled" && tvRes.value?.results
            ? tvRes.value.results.map((t) => ({
                id: t.id,
                title: t.name,
                poster_path: t.poster_path,
                backdrop_path: t.backdrop_path,
                release_date: t.first_air_date,
                vote_average: t.vote_average,
                media_type: "tv" as const,
                overview: t.overview,
              }))
            : [];

        const maxLen = Math.max(moviesList.length, tvList.length);
        for (let i = 0; i < maxLen; i++) {
          if (moviesList[i]) combinedResults.push(moviesList[i]);
          if (tvList[i]) combinedResults.push(tvList[i]);
        }
      } catch (err) {
        console.warn("TMDB search error in NavSearch, using catalog fallback:", err);
      }

      // Catalog fallback if empty
      if (combinedResults.length === 0) {
        const q = trimmed.toLowerCase();
        const movieMatches: SearchResultItem[] = MOCK_MOVIES.filter(
          (m) =>
            m.title.toLowerCase().includes(q) ||
            m.original_title.toLowerCase().includes(q) ||
            (m.overview && m.overview.toLowerCase().includes(q)),
        ).map((m) => ({
          id: m.id,
          title: m.title,
          poster_path: m.poster_path,
          backdrop_path: m.backdrop_path,
          release_date: m.release_date,
          vote_average: m.vote_average,
          media_type: "movie",
          overview: m.overview,
        }));

        const tvMatches: SearchResultItem[] = MOCK_TV_SHOWS.filter(
          (t) =>
            t.name.toLowerCase().includes(q) ||
            t.original_name.toLowerCase().includes(q) ||
            (t.overview && t.overview.toLowerCase().includes(q)),
        ).map((t) => ({
          id: t.id,
          title: t.name,
          poster_path: t.poster_path,
          backdrop_path: t.backdrop_path,
          release_date: t.first_air_date,
          vote_average: t.vote_average,
          media_type: "tv",
          overview: t.overview,
        }));

        combinedResults = [...movieMatches, ...tvMatches];
      }

      if (isMounted) {
        setResults(combinedResults);
        setIsLoading(false);
      }
    };

    searchCatalog();

    return () => {
      isMounted = false;
    };
  }, [debouncedQuery]);

  // Filter results by active tab
  const filteredResults = useMemo(() => {
    if (activeFilter === "all") return results;
    return results.filter((item) => item.media_type === activeFilter);
  }, [results, activeFilter]);

  // Floating window ONLY opens when user has typed something
  const showDropdown = isOpen && query.trim().length > 0;

  return (
    <div className={cn("relative", rail && "flex items-center justify-center")} ref={containerRef}>
      {/* Search Trigger & Expanding Input */}
      <div className={cn("flex items-center", rail && "shrink-0")}>
        <AnimatePresence mode="wait" initial={false}>
          {!isOpen ? (
            <motion.button
              key="search-trigger"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              type="button"
              onClick={() => setIsOpen(true)}
              aria-label="Search titles, actors, genres"
              className={cn(
                "group flex cursor-pointer items-center gap-2 transition-colors",
                rail
                  ? "size-11 justify-center rounded-full text-white/65 hover:bg-white/10 hover:text-white"
                  : "p-2 text-white/80 hover:text-white",
              )}
            >
              <IoSearchOutline
                size={rail ? 18 : 20}
                className="transition-transform duration-200 group-hover:scale-110"
              />
            </motion.button>
          ) : (
            <motion.div
              key="search-input-box"
              initial={{ width: 40, opacity: 0, scale: 0.95 }}
              animate={{ width: "auto", opacity: 1, scale: 1 }}
              exit={{ width: 40, opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 420, damping: 30 }}
              className={cn(
                "flex items-center rounded-full border border-[color:var(--sf-hairline)] bg-black/90 px-2.5 py-1 shadow-lg backdrop-blur-md",
                "focus-within:border-[color:var(--sf-accent)] focus-within:ring-1 focus-within:ring-[var(--sf-accent)]",
                rail
                  ? "fixed top-1/2 left-[88px] z-60 w-[min(66vw,320px)] -translate-y-1/2 shadow-black/70"
                  : "w-[min(36vw,11rem)] origin-right shadow-black/60 sm:w-52 md:w-56",
              )}
            >
              <IoSearchOutline size={15} className="text-gray-300 shrink-0 mr-1.5" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                className="bg-transparent text-xs sm:text-sm text-white placeholder-gray-400 outline-hidden w-full"
              />
              <AnimatePresence>
                {query && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.15 }}
                    type="button"
                    onClick={() => {
                      setQuery("");
                      inputRef.current?.focus();
                    }}
                    className="text-gray-400 hover:text-white p-0.5 shrink-0 transition-colors cursor-pointer mr-0.5"
                    aria-label="Clear search"
                  >
                    <IoClose size={15} />
                  </motion.button>
                )}
              </AnimatePresence>
              <button
                type="button"
                onClick={handleClose}
                className="text-gray-400 hover:text-white p-0.5 shrink-0 transition-colors cursor-pointer border-l border-white/20 pl-1 ml-0.5"
                aria-label="Close search"
                title="Close (Esc)"
              >
                <IoClose size={15} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Search Results Dropdown List - ONLY Opens When User Has Typed */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            key="floating-search-card"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className={cn(
              "absolute top-full z-50 mt-2 flex flex-col overflow-hidden rounded-2xl border border-white/12 bg-[#121212]/95 text-white shadow-[0_16px_50px_rgba(0,0,0,0.9)] backdrop-blur-2xl",
              rail
                ? "fixed top-[calc(50%+26px)] left-[88px] z-60 w-[min(86vw,380px)]"
                : "right-0 w-[calc(100vw-2rem)] max-w-[400px] sm:w-[360px] md:w-[400px]",
            )}
          >
            {/* Header: Category Filter Pills & Results Count */}
            <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 bg-black/40 border-b border-white/10">
              <div className="flex items-center gap-1.5">
                {(["all", "movie", "tv"] as const).map((filter) => {
                  const isActive = activeFilter === filter;
                  const label = filter === "all" ? "All" : filter === "movie" ? "Movies" : "TV Series";
                  return (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setActiveFilter(filter)}
                      className={cn(
                        "px-2.5 py-1 rounded-full text-xs font-semibold transition-all duration-150 cursor-pointer",
                        isActive
                          ? "bg-[var(--sf-accent)] text-[var(--sf-on-accent)] shadow-xs"
                          : "bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white",
                      )}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              <span className="text-[11px] text-gray-400">
                {isLoading ? (
                  "Searching..."
                ) : (
                  <span>
                    <strong className="text-white">{filteredResults.length}</strong> results
                  </span>
                )}
              </span>
            </div>

            {/* Scrollable Floating Results List */}
            <div className="max-h-[360px] sm:max-h-[400px] overflow-y-auto divide-y divide-white/5 p-1.5">
              {/* Loading State */}
              {isLoading && (
                <div className="flex flex-col gap-2 p-2">
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-2 rounded-lg bg-white/5 animate-pulse"
                    >
                      <div className="w-11 h-15 rounded-md bg-white/10 shrink-0" />
                      <div className="flex flex-col gap-2 flex-1">
                        <div className="h-3.5 w-3/4 bg-white/10 rounded-md" />
                        <div className="h-2.5 w-1/3 bg-white/10 rounded-md" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Results Found */}
              {!isLoading && filteredResults.length > 0 && (
                <div className="flex flex-col gap-1 p-1">
                  {filteredResults.map((item) => (
                    <FloatingListItem
                      key={`res-row-${item.media_type}-${item.id}`}
                      item={item}
                      onClose={handleClose}
                    />
                  ))}
                </div>
              )}

              {/* No Results Found */}
              {!isLoading && filteredResults.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 px-4 text-center gap-2">
                  <IoSearchOutline size={30} className="text-gray-500" />
                  <p className="text-sm font-bold text-white">
                    No results found for &ldquo;{query}&rdquo;
                  </p>
                  <p className="text-xs text-gray-400">
                    Try checking for spelling or search for another movie or series.
                  </p>
                </div>
              )}
            </div>

            {/* Floating Card Footer */}
            <div className="px-3.5 py-1.5 bg-black/50 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-400">
              <span>Click title to view or ▶ to play</span>
              <span>ESC to close</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface FloatingListItemProps {
  item: SearchResultItem;
  onClose: () => void;
}

const FloatingListItem: React.FC<FloatingListItemProps> = ({ item, onClose }) => {
  const isTv = item.media_type === "tv";
  const detailHref = isTv ? `/tv/${item.id}` : `/movie/${item.id}`;
  const playHref = isTv ? `/watch/tv/${item.id}/1/1` : `/watch/movie/${item.id}`;
  const posterUrl = item.poster_path
    ? getImageUrl(item.poster_path, "poster")
    : item.backdrop_path
    ? getImageUrl(item.backdrop_path, "backdrop")
    : null;
  const releaseYear = item.release_date ? new Date(item.release_date).getFullYear() : null;
  const rating = item.vote_average ? item.vote_average.toFixed(1) : "8.2";

  return (
    <div className="group flex items-center justify-between gap-3 p-2 hover:bg-white/10 rounded-lg transition-colors cursor-pointer">
      {/* Clickable Info Area */}
      <Link href={detailHref} onClick={onClose} className="flex items-center gap-3 flex-1 min-w-0">
        {/* Poster Thumbnail */}
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={item.title}
            className="w-9 h-13 rounded-md object-cover bg-[#222] shrink-0 border border-white/10 group-hover:border-white/30 transition-colors"
            loading="lazy"
          />
        ) : (
          <div className="w-9 h-13 rounded-md bg-[#222] shrink-0 flex items-center justify-center text-[9px] text-gray-500 font-bold border border-white/10">
            {isTv ? "TV" : "MOVIE"}
          </div>
        )}

        {/* Text Content */}
        <div className="flex flex-col min-w-0 gap-0.5">
          <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-[var(--sf-accent)] transition-colors truncate">
            {item.title}
          </h4>

          <div className="flex items-center gap-2 text-[11px] text-gray-300">
            <span className="bg-[var(--sf-accent)] text-[var(--sf-on-accent)] text-[9px] font-black uppercase px-1 py-0.5 rounded-md tracking-wider">
              {isTv ? "SERIES" : "MOVIE"}
            </span>
            {releaseYear && <span>{releaseYear}</span>}
            <span className="flex items-center gap-1 font-semibold text-[var(--sf-accent)]">
              <FaStar className="size-2.5" />
              {rating}
            </span>
          </div>

          {item.overview && (
            <p className="text-[11px] text-gray-400 line-clamp-1">
              {item.overview}
            </p>
          )}
        </div>
      </Link>

      {/* Quick Action Buttons */}
      <div className="flex items-center gap-1.5 shrink-0 pl-1">
        <Link
          href={playHref}
          onClick={onClose}
          className="flex items-center justify-center size-7 rounded-full bg-[var(--sf-accent)] text-[var(--sf-on-accent)] shadow-[0_0_14px_var(--sf-glow-soft)] transition-colors hover:brightness-110 active:scale-95"
          title="Play Now"
          aria-label={`Play ${item.title}`}
        >
          <FaPlay className="text-[10px] ml-0.5" />
        </Link>

        <Link
          href={detailHref}
          onClick={onClose}
          className="flex items-center justify-center size-7 rounded-full bg-white/10 hover:bg-white/20 text-gray-200 hover:text-white transition-colors border border-white/10 active:scale-95"
          title="More Info"
          aria-label={`Info for ${item.title}`}
        >
          <IoInformationCircleOutline size={17} />
        </Link>
      </div>
    </div>
  );
};

export default NavSearch;
