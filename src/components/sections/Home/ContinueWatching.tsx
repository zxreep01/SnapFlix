"use client";

import Carousel from "@/components/ui/wrapper/Carousel";
import useWatchHistory from "@/hooks/useWatchHistory";
import Reveal from "@/components/ui/other/Reveal";
import Link from "next/link";
import WatchProgressCard from "./WatchProgressCard";
import ResumeCard from "./Cards/Resume";

/**
 * "Continue watching" surface.
 *
 * Phones get the compact activity sheet (headline figure, curve, rows) while
 * larger screens keep the cinematic rail of resume cards.
 */
const ContinueWatching: React.FC = () => {
  const { data: list } = useWatchHistory();

  if (!list || list.length === 0) return null;

  return (
    <section id="continue-watching" aria-label="Continue watching" className="w-full">
      {/* Mobile: activity sheet */}
      <Reveal>
        <WatchProgressCard items={list} />
      </Reveal>

      {/* Tablet & desktop: resume rail */}
      <Reveal className="hidden flex-col gap-3 md:flex">
        <div className="flex items-baseline justify-between gap-3 px-4 md:px-8">
          <span className="sf-board min-w-0">
            <span className="sf-bulb" aria-hidden />
            <span className="sf-board-title">Continue Watching</span>
          </span>
          <Link
            href="/library"
            className="shrink-0 text-[11px] font-semibold text-white/55 transition-colors hover:text-white"
          >
            See all
          </Link>
        </div>

        <Carousel classNames={{ viewport: "px-4 md:px-8" }}>
          {list.map((media) => (
            <div
              key={`${media.type}_${media.media_id}_${media.season}_${media.episode}`}
              className="embla__slide flex min-h-fit max-w-fit items-center py-1"
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
