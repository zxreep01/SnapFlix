import { LoadingOverlay } from "@/components/ui/other/LoadingScreen";

const heroFrame =
  "relative h-[62dvh] min-h-[420px] max-h-[540px] w-full overflow-hidden bg-[#0c0c0e] sm:h-[70dvh] sm:min-h-[500px] sm:max-h-[680px] lg:h-[78dvh] lg:min-h-[560px] lg:max-h-[820px]";

export default function Loading() {
  return (
    <div className="flex w-full flex-col">
      <div className={heroFrame}>
        <div className="absolute inset-0 animate-pulse bg-white/5" />
        <LoadingOverlay label="Loading title" size="md" />
      </div>
    </div>
  );
}
