// useViewport — minimal SSR-safe viewport hook + responsive helpers.
//
// Phase 5 (#25) of the Vite migration. The pre-#25 setup used
// src/direction-responsive.css with `[style*="..."]` substring
// selectors and `!important` overrides to retrofit responsive
// behavior onto the inline-styled prototypes — brittle and unable to
// reach element-specific changes (e.g. #11's hamburger nav, D1
// marquee text cap, D3 metrics-row 4/2/1 step). Phase 5 replaces
// that overlay with React state: components read `bp` from
// useViewport() and write the responsive value inline.
//
// Breakpoints match the v2 README:
//   mobile  ≤ 480px
//   tablet  ≤ 880px
//   desktop > 880px
//
// Phase 5 keeps the visual behavior the CSS overlay was producing —
// no UX change; phase 6 (#26) lands #11's specific refinements.
import { useEffect, useState } from "react";

export type Breakpoint = "mobile" | "tablet" | "desktop";

export interface Viewport {
  width: number;
  bp: Breakpoint;
}

const MOBILE_MAX = 480;
const TABLET_MAX = 880;

function bpFor(width: number): Breakpoint {
  if (width <= MOBILE_MAX) return "mobile";
  if (width <= TABLET_MAX) return "tablet";
  return "desktop";
}

function readWidth(): number {
  if (typeof window === "undefined") return 1280;
  return window.innerWidth;
}

export function useViewport(): Viewport {
  const [width, setWidth] = useState<number>(() => readWidth());
  useEffect(() => {
    let frame = 0;
    const onResize = () => {
      // rAF debounce — resize fires up to once per frame on drag.
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setWidth(window.innerWidth));
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
    };
  }, []);
  return { width, bp: bpFor(width) };
}

// ─── Responsive helpers ──────────────────────────────────────────────
//
// These return the value the section / grid / typography should use
// at the current breakpoint, mirroring what src/direction-responsive
// .css used to enforce via attribute selectors.

// Section padding. The CSS overlay collapsed every direction section
// to 64px / 20px on tablet and 48px / 16px on mobile, regardless of
// the desktop value. Most sections aren't the canonical "140px 56px"
// — e.g. PositioningD1 is "140px 56px 120px", WaitlistD1 is
// "160px 56px". Pass the desktop variant explicitly when it differs;
// the default covers the most common shape.
export function sectionPadding(
  bp: Breakpoint,
  desktop: string = "140px 56px",
): string {
  if (bp === "mobile") return "48px 16px";
  if (bp === "tablet") return "64px 20px";
  return desktop;
}

// Grid columns: every multi-column inline grid (`repeat(N, 1fr)`)
// collapsed to `1fr` at ≤880px in the CSS overlay. Phase 5 keeps
// that behavior; phase 6 may refine specific grids (e.g. D3 metrics
// row → 4/2/1).
export function collapseGridColumns(
  bp: Breakpoint,
  desktopColumns: string,
): string {
  return bp === "mobile" || bp === "tablet" ? "1fr" : desktopColumns;
}

// Hero glyph cap: D1's giant scrolling serif, D3's typestamp, etc.
// inline `font-size: 720` (or 200/120/etc.). The CSS overlay capped
// any 3-digit-or-larger font-size at 64px on mobile. Use this for
// the same effect.
export function capHeroFontSize(
  bp: Breakpoint,
  desktopPx: number,
): number {
  if (bp === "mobile") return Math.min(desktopPx, 64);
  return desktopPx;
}
