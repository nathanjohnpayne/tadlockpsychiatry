// Direction 1 — Editorial Noir theme tokens.
//
// Phase 5 (#25) extraction. The pre-#25 D1 component computed these
// constants inline at the top of its function body; they're moved
// here so sub-components can receive a typed `theme` prop instead of
// 8+ individually-passed primitives. Values are byte-identical to the
// pre-#25 inline literals — phase 5 is structural, no design change.
import type { Tweaks } from "../../src/types";

export interface D1Theme {
  bg: string;
  fg: string;
  dim: string;
  faint: string;
  veryFaint: string;
  accent: string;
  serif: string;
  sans: string;
  mono: string;
  dark: boolean;
  heroVariant: string;
}

export function getD1Theme(tweaks: Tweaks): D1Theme {
  const dark = tweaks.dark !== false;
  const accent = tweaks.accent || "#C9A876";
  const serif =
    tweaks.serif || '"Cormorant Garamond", "Tiempos", Georgia, serif';
  const sans =
    tweaks.sans ||
    '"Inter", "Söhne", -apple-system, system-ui, sans-serif';
  const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';
  const heroVariant = tweaks.heroVariant || "monogram";

  const bg = dark ? "#0E0F12" : "#F5F1EA";
  const fg = dark ? "#E8E4DC" : "#1A1815";
  const dim = dark ? "rgba(232,228,220,0.55)" : "rgba(26,24,21,0.55)";
  const faint = dark ? "rgba(232,228,220,0.12)" : "rgba(26,24,21,0.12)";
  const veryFaint =
    dark ? "rgba(232,228,220,0.06)" : "rgba(26,24,21,0.06)";

  return {
    bg, fg, dim, faint, veryFaint, accent,
    serif, sans, mono, dark, heroVariant,
  };
}
