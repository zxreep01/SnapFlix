"use client";

import MoviePosterCard from "@/components/sections/Movie/Cards/Poster";
import RailHeader from "@/components/ui/other/RailHeader";
import Carousel from "@/components/ui/wrapper/Carousel";
import { QueryList } from "@/types";
import { MOCK_MOVIES } from "@/utils/mockData";
import { Skeleton } from "@heroui/react";
import { useInViewport } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { kebabCase } from "string-ts";
import { Movie } from "tmdb-ts/dist/types";

const MovieHomeList: React.FC<QueryList<Movie>> = ({ query, name, param }) => {
  const key = kebabCase(name) + "-list";
  const { ref, inViewport } = useInViewport();
  const { data, isPending } = useQuery({
    queryFn: async () => {
      try {
        const res = await query();
        if (res?.results?.length > 0) return res;
      } catch (err) {
        console.warn(`Query failed for ${name}, using fallback:`, err);
      }
      return {
        page: 1,
        results: MOCK_MOVIES,
        total_pages: 1,
        total_results: MOCK_MOVIES.length,
      };
    },
    queryKey: [key],
    enabled: inViewport,
  });

  const results = data?.results && data.results.length > 0 ? data.results : MOCK_MOVIES;
  const href = `/discover?type=${param}`;

  return (
    <section id={key} className="min-h-[230px] py-2 md:min-h-[270px]" ref={ref}>
      {isPending && results.length === 0 ? (
        <div className="flex w-full flex-col gap-3 px-4 sm:px-5 md:px-8">
          <div className="flex grow items-center justify-between">
            <Skeleton className="h-6 w-44 rounded-full opacity-20" />
            <Skeleton className="h-6 w-20 rounded-full opacity-20" />
          </div>
          <div className="sf-no-scrollbar flex gap-3 overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton
                key={i}
                className="aspect-2/3 w-[136px] shrink-0 rounded-2xl opacity-25 sm:w-[148px] md:w-[156px] lg:w-[168px]"
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          <RailHeader title={name} href={href} className="px-4 sm:px-5 md:px-8" />

          <Carousel classNames={{ viewport: "px-4 sm:px-5 md:px-8" }}>
            {results.map((movie) => (
              <div
                key={movie.id}
                className="embla__slide flex min-h-fit max-w-fit items-center py-2 pr-3"
              >
                <MoviePosterCard movie={movie} />
              </div>
            ))}
          </Carousel>
        </div>
      )}
    </section>
  );
};

export default MovieHomeList;
