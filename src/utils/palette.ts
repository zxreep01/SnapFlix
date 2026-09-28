/**
 * Cover-art theming engine.
 *
 * SnapFlix takes its colour from the artwork of whatever is playing on screen:
 * one vibrant colour is sampled from the poster/backdrop and expanded into a
 * complete, contrast-safe palette (accents, hairlines, glows, panel tints and
 * a family of tile hues). Those values are published as CSS variables so both
 * plain markup and HeroUI components share a single theme.
 *
 * @example
 * paletteFromHex("#3FA9F5")
 * // -> { accent: "hsl(203 78% 52%)", onAccent: "#FFFFFF", tiles: [...] }
 */

export interface CoverPalette {
  /** Cache/source key for this palette (usually the sampled hex). */
  key: string;
  /** Primary vibrant colour sampled from the artwork. */
  accent: string;
  /** Lighter accent for hovers and secondary highlights. */
  accentSoft: string;
  /** Darker accent for pressed states, gradients and hero scrims. */
  accentDeep: string;
  /** Desaturated accent for quiet chips and inactive states. */
  accentMuted: string;
  /** Text/icon colour that stays readable on top of {@link accent}. */
  onAccent: string;
  /** Strong accent glow for shadows. */
  glow: string;
  /** Soft accent glow for large ambient shadows. */
  glowSoft: string;
  /** Translucent accent used for 1px borders. */
  hairline: string;
  /** Very light accent wash used for chips and surfaces. */
  tint: string;
  /** Deepest background tinted with the artwork hue. */
  surface: string;
  /** Slightly raised surface tinted with the artwork hue. */
  surfaceAlt: string;
  /** Top stop of the floating panel gradient. */
  panelFrom: string;
  /** Bottom stop of the floating panel gradient. */
  panelTo: string;
  /** Bottom-up scrim used over hero artwork. */
  scrim: string;
  /** Monochromatic family of tile colours derived from the same hue. */
  tiles: string[];
  hue: number;
  saturation: number;
  lightness: number;
}

type RGB = { r: number; g: number; b: number };
type HSL = { h: number; s: number; l: number };

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const round = (value: number): number => Math.round(value);

/** Formats an HSL triple the way HeroUI expects its CSS variables. */
const triplet = ({ h, s, l }: HSL): string => `${round(h)} ${round(s)}% ${round(l)}%`;

const hsl = ({ h, s, l }: HSL, alpha?: number): string =>
  alpha === undefined ? `hsl(${round(h)} ${round(s)}% ${round(l)}%)` : `hsla(${round(h)}, ${round(s)}%, ${round(l)}%, ${alpha})`;

export const hexToRgb = (hex: string): RGB => {
  const clean = hex.replace("#", "").trim();
  const value =
    clean.length === 3
      ? clean
          .split("")
          .map((char) => char + char)
          .join("")
      : clean.padEnd(6, "0").slice(0, 6);

  return {
    r: parseInt(value.slice(0, 2), 16) || 0,
    g: parseInt(value.slice(2, 4), 16) || 0,
    b: parseInt(value.slice(4, 6), 16) || 0,
  };
};

export const rgbToHex = ({ r, g, b }: RGB): string =>
  `#${[r, g, b]
    .map((channel) => clamp(round(channel), 0, 255).toString(16).padStart(2, "0"))
    .join("")}`;

export const rgbToHsl = ({ r, g, b }: RGB): HSL => {
  const red = clamp(r, 0, 255) / 255;
  const green = clamp(g, 0, 255) / 255;
  const blue = clamp(b, 0, 255) / 255;

  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;
  const l = (max + min) / 2;

  if (delta === 0) return { h: 0, s: 0, l: l * 100 };

  const s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
  let h: number;

  switch (max) {
    case red:
      h = (green - blue) / delta + (green < blue ? 6 : 0);
      break;
    case green:
      h = (blue - red) / delta + 2;
      break;
    default:
      h = (red - green) / delta + 4;
  }

  return { h: (h / 6) * 360, s: s * 100, l: l * 100 };
};

export const hexToHsl = (hex: string): HSL => rgbToHsl(hexToRgb(hex));

/** Relative luminance (0 = black, 1 = white) used for contrast decisions. */
export const luminance = ({ r, g, b }: RGB): number => {
  const channels = [r, g, b].map((channel) => {
    const value = clamp(channel, 0, 255) / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
};

/** Returns the most readable foreground (near-black or white) for a colour. */
export const readableOn = (hex: string): string =>
  luminance(hexToRgb(hex)) > 0.42 ? "#0B0B0B" : "#FFFFFF";

/**
 * Normalises any sampled colour into a full theme.
 *
 * Saturation and lightness are nudged into a band where the accent still reads
 * as "vibrant" but every text/icon placed on it stays legible, which is what
 * makes the palette safe to reuse across the whole interface.
 *
 * @param source Colour sampled from the cover art.
 * @returns A complete {@link CoverPalette}.
 */
export const paletteFromHex = (source: string): CoverPalette => {
  const { h, s, l } = hexToHsl(source);
  return paletteFromHsl(h, s, l, source.toLowerCase());
};

export const paletteFromHsl = (
  hue: number,
  saturation: number,
  lightness: number,
  key: string,
): CoverPalette => {
  const h = ((hue % 360) + 360) % 360;
  const s = clamp(saturation, 46, 90);
  const l = clamp(lightness, 44, 58);

  const accent = hsl({ h, s, l });
  const accentSoft = hsl({ h, s: clamp(s - 8, 40, 90), l: clamp(l + 13, 50, 74) });
  const accentDeep = hsl({ h, s: clamp(s + 4, 50, 96), l: clamp(l - 24, 18, 34) });
  const accentMuted = hsl({ h, s: clamp(s - 30, 16, 60), l: clamp(l - 10, 28, 46) });

  const tiles = [0, 1, 2, 3, 4, 5, 6].map((index) => {
    const offsets = [0, 24, -22, 46, -44, 12, -10];
    const lightnesses = [l, clamp(l - 10, 34, 54), clamp(l + 8, 46, 62), clamp(l - 20, 26, 44), clamp(l + 14, 50, 66), clamp(l - 14, 30, 50), clamp(l + 4, 42, 58)];
    return hsl({
      h: h + offsets[index],
      s: clamp(s - index * 3, 34, 90),
      l: lightnesses[index],
    });
  });

  return {
    key,
    accent,
    accentSoft,
    accentDeep,
    accentMuted,
    onAccent: readableOn(accent),
    glow: hsl({ h, s, l }, 0.45),
    glowSoft: hsl({ h, s, l }, 0.22),
    hairline: hsl({ h, s: clamp(s - 10, 40, 90), l }, 0.32),
    tint: hsl({ h, s: clamp(s - 6, 44, 90), l }, 0.12),
    surface: hsl({ h, s: 20, l: 7 }),
    surfaceAlt: hsl({ h, s: 17, l: 11 }),
    panelFrom: hsl({ h, s: 20, l: 9 }, 0.92),
    panelTo: hsl({ h, s: 16, l: 5 }, 0.96),
    scrim: `linear-gradient(180deg, ${hsl({ h, s: 18, l: 6 }, 0.05)} 0%, ${hsl({ h, s: 20, l: 5 }, 0.72)} 62%, ${hsl({ h, s: 22, l: 4 })} 100%)`,
    tiles,
    hue: h,
    saturation: s,
    lightness: l,
  };
};

/** SnapFlix signature red — used until artwork colours are available. */
export const FALLBACK_PALETTE: CoverPalette = paletteFromHex("#E50914");

/**
 * Picks the most expressive colour out of a sampled image.
 *
 * Pixels are scored by how often they appear, how saturated they are and how
 * close they sit to a "poster accent" lightness. Near-black, blown-out and
 * washed-out pixels are ignored so a dark scene still yields a usable accent.
 *
 * @param pixels Raw RGBA channel data.
 * @param step Sampling stride (every Nth pixel) to keep the loop cheap.
 * @returns The strongest colour found, or `null` when nothing qualifies.
 */
export const pickAccentFromPixels = (pixels: Uint8ClampedArray, step = 3): string | null => {
  const buckets = new Map<string, { rgb: RGB; count: number; score: number }>();

  for (let i = 0; i < pixels.length; i += 4 * step) {
    const alpha = pixels[i + 3];
    if (alpha < 200) continue;

    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];

    const { s, l } = rgbToHsl({ r, g, b });
    if (s < 22 || l < 14 || l > 88) continue;

    // Quantise so visually identical pixels collapse into one bucket.
    const key = `${r >> 4}-${g >> 4}-${b >> 4}`;
    const existing = buckets.get(key);

    // Reward saturated mid-lightness colours, the ones that read as "cover art".
    const score = (s / 100) * (1 - Math.abs(l - 52) / 60);

    if (existing) {
      existing.count += 1;
      existing.score += score;
    } else {
      buckets.set(key, { rgb: { r, g, b }, count: 1, score });
    }
  }

  let best: { rgb: RGB; weight: number } | null = null;

  for (const bucket of buckets.values()) {
    const weight = bucket.score * Math.log2(bucket.count + 1);
    if (!best || weight > best.weight) {
      best = { rgb: bucket.rgb, weight };
    }
  }

  return best ? rgbToHex(best.rgb) : null;
};

/**
 * Maps a palette onto CSS custom properties.
 *
 * Besides the `--sf-*` tokens, the HeroUI primary ramp and focus ring are
 * rewritten so stock HeroUI components (buttons, tabs, chips, spinners,
 * switches, progress bars) inherit the cover-art colour automatically.
 */
export const paletteToCssVars = (palette: CoverPalette): Record<string, string> => {
  const h = palette.hue;
  const s = palette.saturation;
  const l = palette.lightness;
  const ramp = {
    50: hsl({ h, s: clamp(s - 6, 40, 90), l: 97 }),
    100: hsl({ h, s: clamp(s - 4, 42, 90), l: 91 }),
    200: hsl({ h, s, l: 82 }),
    300: hsl({ h, s, l: 70 }),
    400: hsl({ h, s, l: clamp(l + 9, 52, 66) }),
    500: palette.accent,
    600: hsl({ h, s: clamp(s + 2, 48, 94), l: clamp(l - 8, 36, 50) }),
    700: hsl({ h, s, l: clamp(l - 16, 26, 42) }),
    800: hsl({ h, s, l: clamp(l - 24, 18, 34) }),
    900: hsl({ h, s, l: clamp(l - 31, 12, 26) }),
  };

  const heroRamp = Object.fromEntries(
    Object.entries(ramp).map(([stop, value]) => [
      `--heroui-primary-${stop}`,
      triplet(hexToHsl(value)),
    ]),
  ) as Record<string, string>;

  return {
    "--sf-accent": palette.accent,
    "--sf-accent-soft": palette.accentSoft,
    "--sf-accent-deep": palette.accentDeep,
    "--sf-accent-muted": palette.accentMuted,
    "--sf-on-accent": palette.onAccent,
    "--sf-glow": palette.glow,
    "--sf-glow-soft": palette.glowSoft,
    "--sf-hairline": palette.hairline,
    "--sf-tint": palette.tint,
    "--sf-surface": palette.surface,
    "--sf-surface-alt": palette.surfaceAlt,
    "--sf-panel-from": palette.panelFrom,
    "--sf-panel-to": palette.panelTo,
    "--sf-scrim": palette.scrim,
    ...heroRamp,
    "--heroui-primary": triplet(hexToHsl(palette.accent)),
    "--heroui-primary-foreground": triplet(hexToHsl(palette.onAccent)),
    // Series accents reuse the same ramp so nothing falls back to a stock hue.
    "--heroui-warning": triplet(hexToHsl(palette.accentSoft)),
    "--heroui-warning-500": triplet(hexToHsl(palette.accentSoft)),
    "--heroui-warning-600": triplet(hexToHsl(palette.accentDeep)),
    "--heroui-warning-foreground": triplet(hexToHsl(palette.onAccent)),
    "--heroui-focus": triplet(hexToHsl(palette.accent)),
  };
};

/**
 * Builds the CSS variables for a tile row: every tile shares the artwork hue
 * and only varies in lightness so the row never looks like a random palette.
 */
export const tileVars = (palette: CoverPalette): Record<string, string> =>
  Object.fromEntries(palette.tiles.map((tile, index) => [`--sf-tile-${index}`, tile]));
