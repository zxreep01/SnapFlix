import { LoadingOverlay } from "@/components/ui/other/LoadingScreen";

/**
 * Player shell skeleton for `/watch/*`.
 *
 * The frame mirrors the real player layout (16:9 stage + details column) so the
 * page does not jump around once the title resolves.
 */
export default function Loading() {
  return (
    <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-black lg:flex-row">
      <div className="relative aspect-video w-full shrink-0 overflow-hidden bg-black lg:aspect-auto lg:h-full lg:flex-1">
        <div className="absolute inset-0 animate-pulse bg-white/5" />
        <LoadingOverlay label="Preparing player" size="md" dim={false} />
      </div>

      <div className="hidden w-[380px] shrink-0 flex-col gap-4 bg-[#0c0c0e] px-6 py-5 lg:flex xl:w-[440px] 2xl:w-[480px]">
        <div className="h-6 w-3/4 animate-pulse rounded-md bg-white/5" />
        <div className="h-3 w-1/2 animate-pulse rounded-full bg-white/5" />
        <div className="mt-3 flex gap-2">
          <div className="size-11 animate-pulse rounded-full bg-white/5" />
          <div className="size-11 animate-pulse rounded-full bg-white/5" />
        </div>
        <div className="mt-4 h-3 w-full animate-pulse rounded-full bg-white/5" />
        <div className="h-3 w-11/12 animate-pulse rounded-full bg-white/5" />
        <div className="h-3 w-9/12 animate-pulse rounded-full bg-white/5" />
        <div className="mt-6 flex flex-col gap-2">
          {[0, 1, 2].map((row) => (
            <div key={row} className="flex items-center gap-3">
              <div className="aspect-video w-28 animate-pulse rounded-lg bg-white/5" />
              <div className="flex flex-1 flex-col gap-2">
                <div className="h-3 w-2/3 animate-pulse rounded-full bg-white/5" />
                <div className="h-3 w-full animate-pulse rounded-full bg-white/5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
