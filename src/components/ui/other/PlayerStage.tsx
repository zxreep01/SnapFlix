"use client";

import { useEffect, useState } from "react";

import { cn } from "@/utils/helpers";
import { LoadingOverlay } from "./LoadingScreen";

export interface PlayerStageProps {
  /** Source of the player iframe. */
  src: string;
  /** Accessible name for the frame. */
  title?: string;
  /** Caption shown while the player boots. */
  loadingLabel?: string;
  className?: string;
  iframeClassName?: string;
}

/**
 * Thin wrapper around the player iframe that keeps a minimal loader on screen
 * until the frame actually fires `load`, so the stage is never a black box.
 */
const PlayerStage: React.FC<PlayerStageProps> = ({
  src,
  title = "SnapFlix player",
  loadingLabel = "Starting playback",
  className,
  iframeClassName,
}) => {
  const [ready, setReady] = useState(false);

  // A new source (next episode, other title) starts from a clean slate.
  useEffect(() => {
    setReady(false);
  }, [src]);

  return (
    <div className={cn("relative h-full w-full overflow-hidden bg-black", className)}>
      <iframe
        key={src}
        src={src}
        title={title}
        className={cn("absolute inset-0 h-full w-full border-0 bg-black", iframeClassName)}
        allow="autoplay; fullscreen; picture-in-picture; encrypted-media; gyroscope; accelerometer"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        onLoad={() => setReady(true)}
      />

      {!ready && <LoadingOverlay label={loadingLabel} size="md" dim={false} />}
    </div>
  );
};

export default PlayerStage;
