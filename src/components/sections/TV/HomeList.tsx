"use client";

import TvShowPosterCard from "@/components/sections/TV/Cards/Poster";
import RailHeader from "@/components/ui/other/RailHeader";
import Carousel from "@/components/ui/wrapper/Carousel";
import Reveal from "@/components/ui/other/Reveal";
import { QueryList } from "@/types";
import { MOCK_TV_SHOWS } from "@/utils/mockData";
import { Skeleton } from "@heroui/react";
import { useInViewport } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { kebabCase } from "string-ts";
import { TV } from "tmdb-ts/dist/types";

const TvShowHomeList: React.FC<QueryList<TV>> = ({ query, name, param }) => {
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
        results: MOCK_TV_SHOWS,
        total_pages: 1,
        total_results: MOCK_TV_SHOWS.length,
      };
    },
    queryKey: [key],
    enabled: inViewport,
  });

  const results = data?.results && data.results.length > 0 ? data.results : MOCK_TV_SHOWS;
  const href = `/discover?type=${param}&content=tv`;

  return (
    <section id={key} className="min-h-[168px] py-1 md:min-h-[204px]" ref={ref}>
      {isPending && results.length === 0 ? (
        <div className="flex w-full flex-col gap-2 px-4 md:px-12">
          <Skeleton className="h-5 w-36 rounded-sf opacity-20" />
          <div className="sf-no-scrollbar flex gap-2 overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton
                key={i}
                className="aspect-video w-[190px] shrink-0 rounded-sf opacity-25 sm:w-[220px] md:w-[248px] lg:w-[280px]"
              />
            ))}
          </div>
        </div>
      ) : (
        <Reveal className="flex flex-col gap-2">
          <RailHeader title={name} href={href} className="px-4 md:px-12" />

          <Carousel classNames={{ viewport: "px-4 md:px-12" }}>
            {results.map((tv) => (
              <div key={tv.id} className="embla__slide flex min-h-fit max-w-fit items-start pr-2">
                <TvShowPosterCard tv={tv} />
              </div>
            ))}
          </Carousel>
        </Reveal>
      )}
    </section>
  );
};

export default TvShowHomeList;
