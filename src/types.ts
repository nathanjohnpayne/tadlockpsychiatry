// Shared types across the public surface and (in phase 3) the
// protected direction modules.
//
// These describe the runtime contract between the direction-loader and
// the gated content it pulls from Firebase Storage:
//
//   1. content.jsx defines a Practice object on window.PRACTICE.
//   2. direction-{1,2,3}.jsx defines a React component on window.D{N}
//      whose props are { tweaks: Tweaks }.
//
// Phase 3 will move the protected sources to TS and import these types
// directly. Phase 4 swaps the runtime contract from globals to
// dynamic-imported ES modules; the types stay shaped the same.
import type { ComponentType } from "react";

// Practice — the content object built by protected/content.jsx today.
// The shape is intentionally permissive: content evolves freely on
// the protected side, and the loader only depends on `portrait` (which
// it overrides with an auth-fetched blob URL before mounting). Other
// fields are passed through to the direction components, which read
// them via window.PRACTICE in phase 2 and via a typed prop in phase 3+.
export interface Practice {
  // Overridden by the loader to a blob: URL after the portrait file
  // is fetched from Storage. May be empty string if the fetch failed.
  portrait: string;
  // Anything else the content file defines. Direction components
  // access these via the shared global; phase 3 will tighten this.
  [key: string]: unknown;
}

// Tweaks — per-direction styling overrides passed in by the HTML shell.
// Each direction's index.html calls bootDirection({ id, tweaks }), and
// the tweaks land on the React component's props. The fields are
// optional and direction-specific defaults fill in the rest.
export interface Tweaks {
  dark?: boolean;
  accent?: string;
  serif?: string;
  sans?: string;
  mono?: string;
  heroVariant?: string;
}

// DirectionComponent — the shape of the default export from
// protected-src/direction-{1,2,3}.tsx (phase 3) and the type the loader
// expects from the eval'd window.D{N} global today.
export type DirectionComponent = ComponentType<{ tweaks: Tweaks }>;
