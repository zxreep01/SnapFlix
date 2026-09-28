"use client";

import type { HistoryDetail } from "@/types/movie";
import { cn } from "@/utils/helpers";
import { ChevronRight, PlayFilled } from "@/utils/icons";
import { formatDuration, getImageUrl } from "@/utils/movies";
import { useMemo } from "react";
import Link from "next/link";

interface WatchProgressCardProps {
  items: HistoryDetail[];
}

/** Percentage of a title the viewer has already seen (0-100). */
const completionOf = (item: HistoryDetail) =>
  item.duration > 0 ? Math.min(100, Math.round((item.last_position / item.duration) * 100)) : 0;

const redirectFor = (item: HistoryDetail) =>
  item.type === "movie"
    ? `/watch/movie/${item.media_id}`
    : `/watch/tv/${item.media_id}/${item.season}/${item.episode}`;

/**
 * Mobile activity sheet.
 *
 * Follows the reference's dark glass panel: one headline figure, a small
 * progress curve and a stack of rows where every title carries an icon, a
 * subtitle and a value on the right. Only shown below `md`.
 */
const WatchProgressCard: React.FC<WatchProgressCardProps> = ({ items }) => {
  const stats = useMemo(() => {
    const tracked = items.filter((item) => !item.completed);
    const average = tracked.length
      ? Math.round(tracked.reduce((total, item) => total + completionOf(item), 0) / tracked.length)
      : 0;

    // Activity per day for the last week, oldest first.
    const days = Array.from({ length: 7 }).map((_, index) => {
      const day = new Date();
      day.setHours(0, 0, 0, 0);
      day.setDate(day.getDate() - (6 - index));
      const next = new Date(day);
      next.setDate(day.getDate() + 1);

      return items.filter((item) => {
        const updated = new Date(item.updated_at).getTime();
        return updated >= day.getTime() && updated < next.getTime();
      }).length;
    });

    return {
      average,
      tracked: tracked.slice(0, 3),
      days,
      peak: Math.max(...days, 1),
      weekly: days.reduce((total, value) => total + value, 0),
    };
  }, [items]);

  if (items.length === 0) return null;

  return (
    <section
      aria-label="Your watch activity"
      className="flex flex-col gap-4 px-4 md:hidden"
    >
      {/* Headline figures + curve */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/45 p-4 backdrop-blur-xl">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold tracking-wide text-white/55 uppercase">
              Continue where you left off
            </p>
            <p className="mt-1 flex items-baseline gap-2">
              <span className="text-3xl leading-none font-black text-white">
                {stats.average}
                <span className="text-xl">%</span>
              </span>
              <span className="truncate text-[11px] font-semibold text-[var(--sf-accent)]">
                {stats.weekly > 0 ? `${stats.weekly} plays this week` : "Start a title today"}
              </span>
            </p>
          </div>

          <Link
            href="/library"
            aria-label="Open your library"
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--sf-accent)] text-[var(--sf-on-accent)] shadow-[0_0_18px_var(--sf-glow)] transition-transform active:scale-95"
          >
            <ChevronRight className="size-4" />
          </Link>
        </div>

        {/* Activity curve drawn from the last seven days */}
        <Sparkline values={stats.days} className="mt-4" />

        <div className="mt-2 flex justify-between text-[10px] font-medium text-white/40">
          <span>7 days ago</span>
          <span>Today</span>
        </div>
      </div>

      {/* Rows */}
      <div className="flex flex-col gap-1.5 rounded-3xl border border-white/10 bg-black/45 p-2 backdrop-blur-xl">
        {stats.tracked.length === 0 && (
          <p className="px-2 py-3 text-xs text-white/55">
            Everything you started is finished — pick something new.
          </p>
        )}

        {stats.tracked.map((item) => {
          const completion = completionOf(item);
          const remaining = Math.max(0, item.duration - item.last_position);
          const subtitle =
            item.type === "tv"
              ? `S${item.season} · E${item.episode} · ${formatDuration(remaining)} left`
              : `${formatDuration(remaining)} left`;

          return (
            <Link
              key={`${item.type}-${item.media_id}-${item.season}-${item.episode}`}
              href={redirectFor(item)}
              className="group flex items-center gap-3 rounded-2xl p-2 transition-colors active:bg-white/5"
            >
              {/* Squircle thumbnail */}
              <span className="relative size-11 shrink-0 overflow-hidden rounded-2xl border border-white/10">
                <img
                  src={getImageUrl(item.poster_path || item.backdrop_path || undefined)}
                  alt=""
                  className="size-full object-cover"
                  loading="lazy"
                />
                <span className="absolute inset-0 flex items-center justify-center bg-black/35 opacity-0 transition-opacity group-active:opacity-100">
                  <PlayFilled className="size-3.5 text-white" />
                </span>
              </span>

              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="truncate text-xs font-bold text-white">{item.title}</span>
                <span className="truncate text-[10px] font-medium text-white/50">{subtitle}</span>
              </span>

              <span className="flex shrink-0 items-center gap-2">
                <span className="text-xs font-bold text-[var(--sf-accent)]">{completion}%</span>
                <span className="flex size-6 items-center justify-center rounded-full border border-white/12 text-white/60">
                  <ChevronRight className="size-3" />
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

/**
 * Small smoothed curve with a gradient fill, used for the weekly activity.
 *
 * @param values Series of values plotted left to right.
 */
const Sparkline: React.FC<{ values: number[]; className?: string }> = ({ values, className }) => {
  const width = 300;
  const height = 64;
  const padding = 6;

  const { line, area, peak } = useMemo(() => {
    const max = Math.max(...values, 1);
    const stepX = (width - padding * 2) / Math.max(1, values.length - 1);
    const points = values.map((value, index) => ({
      x: padding + index * stepX,
      y: height - padding - (value / max) * (height - padding * 3),
    }));

    // Smooth the polyline into a soft curve for the small panel.
    const path = points
      .map((point, index) => {
        if (index === 0) return `M ${point.x} ${point.y}`;
        const previous = points[index - 1];
        const midX = (previous.x + point.x) / 2;
        return `Q ${midX} ${previous.y} ${point.x} ${point.y}`;
      })
      .join(" ");

    const peakIndex = values.indexOf(Math.max(...values));

    return {
      line: path,
      area: `${path} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`,
      peak: { ...points[peakIndex], value: values[peakIndex] },
    };
  }, [values]);

  return (
    <div className={cn("relative w-full", className)}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="h-16 w-full"
        aria-hidden
      >
        <defs>
          <linearGradient id="sf-spark-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--sf-accent)" stopOpacity="0.42" />
            <stop offset="100%" stopColor="var(--sf-accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#sf-spark-fill)" />
        <path
          d={line}
          fill="none"
          stroke="var(--sf-accent)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx={peak.x} cy={peak.y} r="4" fill="var(--sf-accent)" />
      </svg>

      {/* Highlighted point label */}
      <span
        className="sf-chip absolute -translate-x-1/2 -translate-y-1/2 !px-2 !py-0 text-[9px] font-bold"
        style={{ left: `${(peak.x / width) * 100}%`, top: `${(peak.y / height) * 100}%` }}
      >
        {peak.value}
      </span>
    </div>
  );
};

export default WatchProgressCard;
