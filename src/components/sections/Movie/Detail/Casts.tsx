"use client";

import { Cast } from "tmdb-ts";
import { getImageUrl } from "@/utils/movies";
import Carousel from "@/components/ui/wrapper/Carousel";
import RowHeader from "@/components/ui/other/RowHeader";

interface CastCardProps {
  casts: Cast[];
}

const CastsSection: React.FC<CastCardProps> = ({ casts }) => {
  if (!casts?.length) return null;

  return (
    <section id="casts" className="flex flex-col gap-3">
      <RowHeader title="Cast" className="px-4 md:px-12" />
      <div className="px-4 md:px-12">
        <Carousel>
          {casts.map((cast) => {
            const avatar = cast.profile_path ? getImageUrl(cast.profile_path, "avatar") : "";
            return (
              <div key={cast.id || cast.name} className="w-[6.75rem] min-w-0! shrink-0 px-1 py-2 sm:w-32">
                {avatar ? (
                  <img
                    src={avatar}
                    alt=""
                    className="size-24 rounded-full object-cover ring-1 ring-white/15 sm:size-28"
                  />
                ) : (
                  <div className="grid size-24 place-items-center rounded-full bg-white/8 text-lg font-semibold text-white/70 ring-1 ring-white/15 sm:size-28">
                    {cast.name?.slice(0, 1)}
                  </div>
                )}
                <p title={cast.name} className="mt-2 line-clamp-2 text-sm font-semibold text-white break-words">
                  {cast.name}
                </p>
                <p
                  title={cast.character}
                  className="line-clamp-2 text-xs text-white/50 break-words"
                >
                  {cast.character}
                </p>
              </div>
            );
          })}
        </Carousel>
      </div>
    </section>
  );
};

export default CastsSection;
