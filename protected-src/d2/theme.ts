// Direction 2 — Quiet Clinical theme tokens.
//
// Phase 5 (#25) extraction. See d1/theme.ts header for the rationale.
// Values are byte-identical to the pre-#25 D2 inline literals.
import type { Tweaks } from "../../src/types";

export interface D2Theme {
  bg: string;
  fg: string;
  dim: string;
  faint: string;
  card: string;
  accent: string;
  sans: string;
  mono: string;
  dark: boolean;
  heroVariant: string;
}

export function getD2Theme(tweaks: Tweaks): D2Theme {
  const dark = tweaks.dark === true;
  const accent = tweaks.accent || "#3E5C7A";
  const sans =
    tweaks.sans ||
    '"Söhne", "Inter", -apple-system, system-ui, sans-serif';
  const mono =
    tweaks.mono ||
    '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';
  const heroVariant = tweaks.heroVariant || "metrics";

  const bg = dark ? "#0F1115" : "#F4F2ED";
  const fg = dark ? "#E8E6E0" : "#14171C";
  const dim = dark ? "rgba(232,230,224,0.55)" : "rgba(20,23,28,0.58)";
  const faint = dark ? "rgba(232,230,224,0.13)" : "rgba(20,23,28,0.13)";
  const card = dark ? "#161A21" : "#FFFFFF";

  return {
    bg, fg, dim, faint, card, accent,
    sans, mono, dark, heroVariant,
  };
}
