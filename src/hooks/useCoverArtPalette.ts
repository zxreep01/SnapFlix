"use client";

import {
  CoverPalette,
  FALLBACK_PALETTE,
  paletteFromHex,
  pickAccentFromPixels,
} from "@/utils/palette";
import { useEffect, useState } from "react";

/**
 * Palettes are derived from remote artwork, so results are memoised per URL.
 * Re-visiting a title (or hovering the same card twice) is then free.
 */
const paletteCache = new Map<string, CoverPalette>();
const pendingRequests = new Map<string, Promise<CoverPalette>>();

const SAMPLE_SIZE = 32;

const loadImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Unable to load artwork: ${url}`));
    image.src = url;
  });

/**
 * Samples a single artwork URL and derives a palette from its dominant accent.
 *
 * @param url Absolute artwork URL (TMDB or any CORS-enabled host).
 * @returns The derived palette, or the SnapFlix fallback when sampling fails.
 */
export const extractPalette = async (url: string): Promise<CoverPalette> => {
  const cached = paletteCache.get(url);
  if (cached) return cached;

  const pending = pendingRequests.get(url);
  if (pending) return pending;

  const request = (async () => {
    try {
      const image = await loadImage(url);
      const canvas = document.createElement("canvas");
      const ratio = Math.min(1, SAMPLE_SIZE / Math.max(image.width, image.height));
      canvas.width = Math.max(1, Math.round(image.width * ratio));
      canvas.height = Math.max(1, Math.round(image.height * ratio));

      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas is unavailable");

      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
      const accent = pickAccentFromPixels(data);

      const palette = accent ? paletteFromHex(accent) : FALLBACK_PALETTE;
      paletteCache.set(url, palette);
      return palette;
    } catch {
      // Offline previews, blocked hosts and missing art all land here.
      paletteCache.set(url, FALLBACK_PALETTE);
      return FALLBACK_PALETTE;
    } finally {
      pendingRequests.delete(url);
    }
  })();

  pendingRequests.set(url, request);
  return request;
};

/**
 * Resolves a palette for one or more artwork candidates.
 *
 * The first URL that yields a colour wins, so callers can pass a backdrop and
 * fall back to a poster without extra branching.
 *
 * @param sources Artwork URL(s), in order of preference.
 * @returns The first usable palette, otherwise the SnapFlix fallback.
 */
export const extractPaletteFromSources = async (
  sources: string | string[] | null | undefined,
): Promise<CoverPalette> => {
  const list = (Array.isArray(sources) ? sources : [sources]).filter(
    (source): source is string => Boolean(source),
  );

  for (const source of list) {
    const palette = await extractPalette(source);
    if (palette.key !== FALLBACK_PALETTE.key) return palette;
  }

  return FALLBACK_PALETTE;
};

/**
 * React binding around {@link extractPaletteFromSources}.
 *
 * Used by single-title surfaces (detail pages, player) that want the theme of
 * one specific piece of artwork without touching the global provider.
 *
 * @param sources Artwork URL(s) to sample.
 * @returns The palette for the artwork, starting from the SnapFlix fallback.
 */
export const useCoverArtPalette = (
  sources: string | string[] | null | undefined,
): CoverPalette => {
  const key = Array.isArray(sources) ? sources.join("|") : sources || "";
  const [palette, setPalette] = useState<CoverPalette>(() => {
    const first = (Array.isArray(sources) ? sources : [sources]).find(Boolean);
    return (first && paletteCache.get(first)) || FALLBACK_PALETTE;
  });

  useEffect(() => {
    let isMounted = true;

    extractPaletteFromSources(sources).then((resolved) => {
      if (isMounted) setPalette(resolved);
    });

    return () => {
      isMounted = false;
    };
    // `key` is the stable identity of the source list.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return palette;
};

export default useCoverArtPalette;
