// Direction 3 — Architectural Performance theme tokens.
//
// Phase 5 (#25) extraction. See d1/theme.ts header for the rationale.
// Values are byte-identical to the pre-#25 D3 inline literals.
import type { Tweaks } from "../../src/types";

export interface D3Theme {
  bg: string;
  fg: string;
  dim: string;
  faint: string;
  card: string;
  inv: string;
  accent: string;
  sans: string;
  mono: string;
  dark: boolean;
  heroVariant: string;
}

export function getD3Theme(tweaks: Tweaks): D3Theme {
  const dark = tweaks.dark === true;
  const accent = tweaks.accent || "#FF5C2A";
  const sans =
    tweaks.sans ||
    '"Söhne", "Inter", -apple-system, system-ui, sans-serif';
  const mono =
    tweaks.mono ||
    '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';
  const heroVariant = tweaks.heroVariant || "blocks";

  const bg = dark ? "#0A0A0A" : "#EFEDE7";
  const fg = dark ? "#F0EDE6" : "#0A0A0A";
  const dim = dark ? "rgba(240,237,230,0.55)" : "rgba(10,10,10,0.55)";
  const faint = dark ? "rgba(240,237,230,0.15)" : "rgba(10,10,10,0.15)";
  const card = dark ? "#141414" : "#FAF8F2";
  const inv = dark ? "#0A0A0A" : "#F0EDE6";

  return {
    bg, fg, dim, faint, card, inv, accent,
    sans, mono, dark, heroVariant,
  };
}
