"use client";

import { extractPaletteFromSources } from "@/hooks/useCoverArtPalette";
import {
  CoverPalette,
  FALLBACK_PALETTE,
  paletteToCssVars,
  tileVars,
} from "@/utils/palette";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

interface CoverThemeContextValue {
  /** Palette currently painted on screen (a focused card wins over the page theme). */
  palette: CoverPalette;
  /** Page-level palette, usually taken from the hero or detail artwork. */
  base: CoverPalette;
  /** Artwork URL that produced {@link base}, used for the ambient backdrop. */
  artwork: string | null;
  /** False while the theme still falls back to SnapFlix red. */
  isThemed: boolean;
  /** Registers the page-level theme for a set of artwork URLs. */
  setBaseTheme: (sources: string | string[] | null, artwork?: string | null) => void;
  /** Temporarily previews the theme of a hovered/focused artwork. */
  setFocusTheme: (sources: string | string[] | null) => void;
  /** Drops the focused theme and restores the page theme. */
  clearFocusTheme: () => void;
}

const CoverThemeContext = createContext<CoverThemeContextValue>({
  palette: FALLBACK_PALETTE,
  base: FALLBACK_PALETTE,
  artwork: null,
  isThemed: false,
  setBaseTheme: () => {},
  setFocusTheme: () => {},
  clearFocusTheme: () => {},
});

/** Delay before a hovered card recolours the app, so quick sweeps stay cheap. */
const FOCUS_DEBOUNCE_MS = 140;

export const CoverThemeProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [base, setBase] = useState<CoverPalette>(FALLBACK_PALETTE);
  const [focus, setFocus] = useState<CoverPalette | null>(null);
  const [artwork, setArtwork] = useState<string | null>(null);
  const focusTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (focusTimer.current) clearTimeout(focusTimer.current);
    };
  }, []);

  // Publish the active palette as CSS variables so plain markup, HeroUI and
  // portal content (drawers, modals, toasts) all inherit the same theme.
  const palette = focus ?? base;

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    const vars = { ...paletteToCssVars(palette), ...tileVars(palette) };

    for (const [name, value] of Object.entries(vars)) {
      root.style.setProperty(name, value);
    }
  }, [palette]);

  const setBaseTheme = useCallback(
    (sources: string | string[] | null, artworkUrl?: string | null) => {
      setArtwork(artworkUrl ?? null);
      extractPaletteFromSources(sources).then((resolved) => {
        if (isMounted.current) setBase(resolved);
      });
    },
    [],
  );

  const setFocusTheme = useCallback((sources: string | string[] | null) => {
    if (focusTimer.current) clearTimeout(focusTimer.current);
    focusTimer.current = setTimeout(() => {
      extractPaletteFromSources(sources).then((resolved) => {
        if (isMounted.current) setFocus(resolved);
      });
    }, FOCUS_DEBOUNCE_MS);
  }, []);

  const clearFocusTheme = useCallback(() => {
    if (focusTimer.current) clearTimeout(focusTimer.current);
    setFocus(null);
  }, []);

  const value = useMemo<CoverThemeContextValue>(
    () => ({
      palette,
      base,
      artwork,
      isThemed: palette.key !== FALLBACK_PALETTE.key,
      setBaseTheme,
      setFocusTheme,
      clearFocusTheme,
    }),
    [palette, base, artwork, setBaseTheme, setFocusTheme, clearFocusTheme],
  );

  return <CoverThemeContext.Provider value={value}>{children}</CoverThemeContext.Provider>;
};

/** Reads the cover-art theme. Must be used inside {@link CoverThemeProvider}. */
export const useCoverTheme = () => useContext(CoverThemeContext);

/**
 * Declares the page-level theme for a screen.
 *
 * @param sources Artwork URL(s) that should colour the whole app.
 * @param artwork Optional artwork URL reused by the ambient backdrop.
 */
export const useCoverArtTheme = (
  sources: string | string[] | null | undefined,
  artwork?: string | null,
) => {
  const { setBaseTheme } = useCoverTheme();
  const key = Array.isArray(sources) ? sources.join("|") : sources || "";

  useEffect(() => {
    setBaseTheme(sources ?? null, artwork ?? null);
    // `key` captures the identity of the source list.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, artwork]);
};

export default CoverThemeProvider;
