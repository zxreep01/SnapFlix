"use client";

import useDiscoverFilters from "@/hooks/useDiscoverFilters";
import DiscoverFilters from "./Filters";
import MovieDiscoverList from "./MovieList";
import TvShowDiscoverList from "./TvShowList";

const DiscoverListGroup = () => {
  const { content } = useDiscoverFilters();

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-5 px-4 pt-5 pb-16 sm:px-5 md:px-8">
      {/* Sleek Netflix Toolbar: Title, Switcher, Genre Dropdown & Categories */}
      <DiscoverFilters />

      {/* Content Grid */}
      <div className="w-full">
        {content === "movie" && <MovieDiscoverList />}
        {content === "tv" && <TvShowDiscoverList />}
      </div>
    </div>
  );
};

export default DiscoverListGroup;
