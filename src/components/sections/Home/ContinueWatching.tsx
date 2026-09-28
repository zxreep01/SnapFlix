"use client";

import Carousel from "@/components/ui/wrapper/Carousel";
import useWatchHistory from "@/hooks/useWatchHistory";
import Reveal from "@/components/ui/other/Reveal";
import RailHeader from "@/components/ui/other/RailHeader";
import ResumeCard from "./Cards/Resume";

/**
 * "Continue Watching" rail.
 *
 * One landscape row on every breakpoint, exactly how Netflix resumes a
 * viewer's unfinished titles.
 */
const ContinueWatching: React.FC = () => {
  const { data: list } = useWatchHistory();

  if (!list || list.length === 0) return null;

  return (
    <section id="continue-watching" aria-label="Continue watching" className="w-full">
      <Reveal className="flex flex-col gap-2">
        <RailHeader
          title="Continue Watching"
          href="/library"
          className="px-4 md:px-12"
        />

        <Carousel classNames={{ viewport: "px-4 md:px-12" }}>
          {list.map((media) => (
            <div
              key={`${media.type}_${media.media_id}_${media.season}_${media.episode}`}
              className="embla__slide flex min-h-fit max-w-fit items-center pr-2"
            >
              <ResumeCard media={media} />
            </div>
          ))}
        </Carousel>
      </Reveal>
    </section>
  );
};

export default ContinueWatching;
