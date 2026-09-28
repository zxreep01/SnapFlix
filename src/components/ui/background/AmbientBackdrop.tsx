"use client";

import { useCoverTheme } from "@/components/ui/theme/CoverThemeProvider";
import { cn } from "@/utils/helpers";
import { memo } from "react";

/**
 * Ambient room behind the floating interface.
 *
 * Mirrors the reference layout: the current cover art, blurred and dimmed,
 * fills the viewport while the panel and rail float above it. When no artwork
 * is available the gradient is built purely from the active palette.
 */
const AmbientBackdrop: React.FC<{ className?: string }> = memo(({ className }) => {
  const { artwork, palette, isThemed } = useCoverTheme();

  return (
    <div
      aria-hidden
      className={cn("pointer-events-none fixed inset-0 -z-10 overflow-hidden", className)}
    >
      {artwork ? (
        <img
          src={artwork}
          alt=""
          className="absolute inset-0 size-full scale-125 object-cover opacity-45 blur-3xl saturate-125"
          loading="lazy"
          draggable={false}
        />
      ) : null}

      {/* Palette wash keeps the room tinted even without artwork */}
      <div
        className="absolute inset-0 transition-colors duration-700"
        style={{
          background: `radial-gradient(120% 90% at 12% 0%, ${palette.accentDeep} 0%, ${palette.surface} 48%, #050505 100%)`,
        }}
      />
      <div
        className="absolute inset-0 opacity-70"
        style={{
          background: `radial-gradient(90% 70% at 88% 105%, ${palette.glow} 0%, transparent 62%)`,
        }}
      />
      <div className="absolute inset-0 bg-black/55" />
      {!isThemed && <div className="absolute inset-0 bg-[#0b0b0b]/70" />}
    </div>
  );
});

AmbientBackdrop.displayName = "AmbientBackdrop";

export default AmbientBackdrop;
