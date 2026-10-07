"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";

import { cn } from "@/utils/helpers";
import {
  alignRing,
  easeInOutCubic,
  morphPath,
  POPCORN_PATHS,
  samplePath,
  TV_PATHS,
  type Point,
} from "@/utils/morph";

/**
 * PopcornTvLoader
 * ---------------
 * A deliberately quiet loading indicator: a thin popcorn bucket that morphs
 * into a TV set and back again, wrapped in a single hairline progress arc.
 *
 * The morph itself is a real shape interpolation, not a cross fade: both icons
 * are described by the same number of closed sub paths, every sub path is
 * sampled into an equal amount of points, the rings are rotationally aligned
 * (so the shapes don't twist while morphing) and then point-by-point
 * interpolated into a smooth closed Catmull-Rom path on every frame.
 *
 * Everything else was stripped away — no halo, no flying kernels, no bouncy
 * dots — so the animation reads as one calm, small mark on screen.
 *
 * Before hydration (and when `prefers-reduced-motion` is set) the static
 * popcorn bucket is rendered instead.
 */

const HOLD_MS = 900;
const MORPH_MS = 900;
const CYCLE_MS = HOLD_MS * 2 + MORPH_MS * 2;

export type PopcornTvLoaderSize = "xs" | "sm" | "md" | "lg";

export interface PopcornTvLoaderProps {
  /** Visual size of the animation. */
  size?: PopcornTvLoaderSize;
  /** Optional caption rendered under the animation. */
  label?: string;
  /** Hides the caption (useful inside tight layouts). */
  hideLabel?: boolean;
  className?: string;
}

/**
 * Stroke widths are expressed in the 100×100 viewBox, so they are pre-scaled
 * to land on roughly the same hairline thickness (1.3px → 2.1px) at every size.
 */
const SIZES = {
  xs: { box: 20, stroke: 6.5, arc: 5.5, text: "text-[10px]" },
  sm: { box: 30, stroke: 5, arc: 4.2, text: "text-[11px]" },
  md: { box: 44, stroke: 4.1, arc: 3.4, text: "text-xs" },
  lg: { box: 60, stroke: 3.5, arc: 3, text: "text-sm" },
} as const;

/** Short arc drawn on a r=45 circle (circumference ≈ 282.7). */
const ARC_DASH = "34 249";

/**
 * All loaders on a page share a single requestAnimationFrame loop (a busy home
 * page can mount eight of them) and a single measurement of both icons, so the
 * shapes stay perfectly in sync while the cost stays flat.
 */
type FrameHandler = (progress: number) => void;

const handlers = new Set<FrameHandler>();
let rafId = 0;
let startedAt = 0;
let cachedRings: { from: Point[][]; to: Point[][] } | null = null;

/** Progress (0 = popcorn, 1 = TV) for a point in time of the loop. */
const morphProgress = (elapsed: number): number => {
  const elapsedInCycle = elapsed % CYCLE_MS;

  if (elapsedInCycle < HOLD_MS) return 0;
  if (elapsedInCycle < HOLD_MS + MORPH_MS) {
    return easeInOutCubic((elapsedInCycle - HOLD_MS) / MORPH_MS);
  }
  if (elapsedInCycle < HOLD_MS * 2 + MORPH_MS) return 1;

  return 1 - easeInOutCubic((elapsedInCycle - HOLD_MS * 2 - MORPH_MS) / MORPH_MS);
};

const tick = (now: number) => {
  const progress = morphProgress(now - startedAt);
  handlers.forEach((handler) => handler(progress));
  rafId = requestAnimationFrame(tick);
};

const subscribe = (handler: FrameHandler) => {
  handlers.add(handler);
  if (!rafId) {
    startedAt = performance.now();
    rafId = requestAnimationFrame(tick);
  }
};

const unsubscribe = (handler: FrameHandler) => {
  handlers.delete(handler);
  if (!handlers.size && rafId) {
    cancelAnimationFrame(rafId);
    rafId = 0;
  }
};

/** Measures both icons once with a throwaway, off screen SVG path element. */
const getRings = (): typeof cachedRings => {
  if (cachedRings || typeof document === "undefined") return cachedRings;

  const measuringSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  measuringSvg.setAttribute("width", "0");
  measuringSvg.setAttribute("height", "0");
  measuringSvg.setAttribute("aria-hidden", "true");
  measuringSvg.style.position = "absolute";
  measuringSvg.style.opacity = "0";
  measuringSvg.style.pointerEvents = "none";
  document.body.appendChild(measuringSvg);

  const measuringPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
  measuringSvg.appendChild(measuringPath);

  try {
    const from = POPCORN_PATHS.map((d) => samplePath(measuringPath, d));
    const to = TV_PATHS.map((d, index) => alignRing(from[index], samplePath(measuringPath, d)));
    cachedRings = { from, to };
  } catch (error) {
    console.warn("PopcornTvLoader: path morph unavailable, keeping the static icon.", error);
  } finally {
    measuringSvg.remove();
  }

  return cachedRings;
};

const PopcornTvLoader: React.FC<PopcornTvLoaderProps> = ({
  size = "md",
  label,
  hideLabel = false,
  className,
}) => {
  const reducedMotion = useReducedMotion();
  const pathRefs = useRef<Array<SVGPathElement | null>>([]);
  const dimensions = SIZES[size] ?? SIZES.md;

  useEffect(() => {
    if (reducedMotion) return;

    const rings = getRings();
    if (!rings) return;

    let handler: FrameHandler | null = null;

    handler = (progress: number) => {
      for (let index = 0; index < rings.from.length; index++) {
        const element = pathRefs.current[index];
        if (element) {
          element.setAttribute("d", morphPath(rings.from[index], rings.to[index], progress));
        }
      }
    };

    subscribe(handler);

    return () => {
      if (handler) unsubscribe(handler);
    };
  }, [reducedMotion]);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label || "Loading"}
      className={cn("flex flex-col items-center justify-center gap-2.5 text-white/60", className)}
    >
      <div className="relative" style={{ width: dimensions.box, height: dimensions.box }}>
        <svg
          viewBox="0 0 100 100"
          className="size-full overflow-visible"
          aria-hidden="true"
          focusable="false"
        >
          {/* Hairline track */}
          <circle cx={50} cy={50} r={45} fill="none" stroke="currentColor" strokeWidth={1} opacity={0.12} />

          {/* A single slow arc sweeping around the track */}
          <motion.g
            style={{ transformOrigin: "50% 50%" }}
            animate={reducedMotion ? { rotate: 0 } : { rotate: 360 }}
            transition={
              reducedMotion
                ? { duration: 0 }
                : { duration: 2.4, repeat: Infinity, ease: "linear" }
            }
          >
            <circle
              cx={50}
              cy={50}
              r={45}
              fill="none"
              stroke="currentColor"
              strokeWidth={dimensions.arc}
              strokeLinecap="round"
              strokeDasharray={ARC_DASH}
              opacity={0.55}
            />
          </motion.g>

          {/* The morphing icon itself */}
          <g
            fill="none"
            stroke="currentColor"
            strokeWidth={dimensions.stroke}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {POPCORN_PATHS.map((d, index) => (
              <path
                key={`morph-${index}`}
                d={d}
                ref={(element) => {
                  pathRefs.current[index] = element;
                }}
              />
            ))}
          </g>
        </svg>
      </div>

      {label && !hideLabel && (
        <p className={cn("max-w-[22rem] text-center leading-snug text-white/45", dimensions.text)}>
          {label}
          <motion.span
            aria-hidden="true"
            className="ml-0.5 inline-block"
            animate={reducedMotion ? { opacity: 0.5 } : { opacity: [0.25, 0.75, 0.25] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          >
            …
          </motion.span>
        </p>
      )}
    </div>
  );
};

export default PopcornTvLoader;
