"use client";

import useDiscoverFilters from "@/hooks/useDiscoverFilters";
import DiscoverFilters from "./Filters";
import MovieDiscoverList from "./MovieList";
import TvShowDiscoverList from "./TvShowList";

const DiscoverListGroup = () => {
  const { content } = useDiscoverFilters();

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-5 px-4 pt-8 pb-16 md:px-12">
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
