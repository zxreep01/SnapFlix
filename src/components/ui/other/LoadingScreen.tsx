"use client";

import { cn } from "@/utils/helpers";
import PopcornTvLoader, {
  type PopcornTvLoaderProps,
  type PopcornTvLoaderSize,
} from "./PopcornTvLoader";

/**
 * Shared loading surfaces.
 *
 * `LoadingScreen` reserves vertical space and centres the loader — used by
 * route level `loading.tsx` files and by any section that swaps its content for
 * a loader while data is in flight.
 *
 * `LoadingOverlay` is the absolute positioned variant for things that keep
 * their frame while loading (player iframes, billboards, drawers).
 */

const MIN_HEIGHTS = {
  /** Roughly a full viewport, minus the top navigation. */
  screen: "min-h-[65dvh]",
  page: "min-h-[calc(100dvh-5.5rem)]",
  section: "min-h-[45vh]",
  inline: "min-h-24",
  none: "",
} as const;

export type LoadingScreenHeight = keyof typeof MIN_HEIGHTS;

export interface LoadingScreenProps {
  /** Caption rendered under the animation. */
  label?: string;
  size?: PopcornTvLoaderSize;
  /** Hides the caption (useful inside tight layouts). */
  hideLabel?: boolean;
  /** How much vertical space to reserve while loading. */
  minHeight?: LoadingScreenHeight;
  className?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  label = "Loading",
  size = "lg",
  hideLabel = false,
  minHeight = "screen",
  className,
}) => (
  <div
    className={cn(
      "flex w-full items-center justify-center px-4 py-10",
      MIN_HEIGHTS[minHeight] ?? MIN_HEIGHTS.screen,
      className,
    )}
  >
    <PopcornTvLoader size={size} label={label} hideLabel={hideLabel} />
  </div>
);

export interface LoadingOverlayProps extends Omit<PopcornTvLoaderProps, "className"> {
  /** Slightly dims whatever sits behind the loader. */
  dim?: boolean;
  className?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  label,
  size = "md",
  hideLabel = false,
  dim = true,
  className,
}) => (
  <div
    className={cn(
      "absolute inset-0 z-20 grid place-items-center px-4",
      dim && "bg-black/55 backdrop-blur-[2px]",
      className,
    )}
  >
    <PopcornTvLoader size={size} label={label} hideLabel={hideLabel} />
  </div>
);

export default LoadingScreen;
