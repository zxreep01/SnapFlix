"use client";

import ContentTypeSelection from "@/components/ui/other/ContentTypeSelection";
import { siteConfig } from "@/config/site";
import { Spinner } from "@heroui/react";
import dynamic from "next/dynamic";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { Suspense } from "react";
import CollectionTiles from "./CollectionTiles";
import ContinueWatching from "./ContinueWatching";
import FeaturedSplit from "./FeaturedSplit";

const MovieHomeList = dynamic(() => import("@/components/sections/Movie/HomeList"));
const TvShowHomeList = dynamic(() => import("@/components/sections/TV/HomeList"));
const Top10Row = dynamic(() => import("@/components/sections/Home/Top10Row"));

/**
 * Home content stack.
 *
 * Mirrors the reference placement: media switcher, the rounded collection
 * tiles, the viewer's own progress, the two-column feature block and finally
 * the collection rails with the Top 10 ranking.
 */
const HomePageList: React.FC = () => {
  const { movies, tvShows } = siteConfig.queryLists;
  const [content] = useQueryState(
    "content",
    parseAsStringLiteral(["movie", "tv"]).withDefault("movie"),
  );

  return (
    <div className="flex flex-col gap-5 md:gap-7">
      {/* Switcher + collection tiles */}
      <div className="flex flex-col gap-4 px-4 sm:px-5 md:px-8">
        <ContentTypeSelection className="self-start" />
        <CollectionTiles contentType={content} />
      </div>

      {/* Viewer's own progress */}
      <ContinueWatching />

      {/* Recent + Recommended For You */}
      <FeaturedSplit contentType={content} />

      <div className="relative flex min-h-32 flex-col gap-4 md:gap-6">
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
