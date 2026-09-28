"use client";

import { siteConfig } from "@/config/site";
import { Spinner } from "@heroui/react";
import dynamic from "next/dynamic";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { Suspense } from "react";
import ContinueWatching from "./ContinueWatching";

const MovieHomeList = dynamic(() => import("@/components/sections/Movie/HomeList"));
const TvShowHomeList = dynamic(() => import("@/components/sections/TV/HomeList"));
const Top10Row = dynamic(() => import("@/components/sections/Home/Top10Row"));

/**
 * Home content stack.
 *
 * Ordered by how the viewer reads the page: what is playing now, what is
 * trending today, then the catalogue rails.
 */
const HomePageList: React.FC = () => {
  const { movies, tvShows } = siteConfig.queryLists;
  const [content] = useQueryState(
    "content",
    parseAsStringLiteral(["movie", "tv"]).withDefault("movie"),
  );

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      {/* Viewer's own progress */}
      <ContinueWatching />

      <div className="relative flex min-h-32 flex-col gap-5 md:gap-7">
        <Suspense
          fallback={
            <Spinner size="lg" variant="simple" className="absolute-center" color="primary" />
          }
        >
          {content === "movie" && (
            <>
              {/* Row 1: Trending */}
              {movies.length > 0 && <MovieHomeList key={movies[0].name} {...movies[0]} />}

              {/* Netflix Signature Top 10 Row */}
              <Top10Row contentType="movie" />

              {/* Remaining Movie Categories */}
              {movies.slice(1).map((movie) => (
                <MovieHomeList key={movie.name} {...movie} />
              ))}
            </>
          )}

          {content === "tv" && (
            <>
              {/* Row 1: Trending TV */}
              {tvShows.length > 0 && <TvShowHomeList key={tvShows[0].name} {...tvShows[0]} />}

              {/* Netflix Signature Top 10 Row */}
              <Top10Row contentType="tv" />

              {/* Remaining TV Categories */}
              {tvShows.slice(1).map((tv) => (
                <TvShowHomeList key={tv.name} {...tv} />
              ))}
            </>
          )}
        </Suspense>
      </div>
    </div>
  );
};

export default HomePageList;
