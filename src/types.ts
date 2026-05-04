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

// Practice — the content object built by protected-src/content.tsx.
// All three direction components read from the same shape so copy
// stays consistent across /d/1, /d/2, /d/3.
//
// The loader overrides `portrait` with an auth-fetched blob: URL
// before mounting. Every other field is rendered as-is by the
// directions; adding a new field to content.tsx without adding it
// here will fail the protected typecheck (intentional — keeps the
// content file and the components in lockstep).
export interface PracticePositioning {
  k: string;
  h: string;
  p: string;
}
export interface PracticeCredential {
  era: string;
  school: string;
  years: string;
}
export interface PracticeSpecialty {
  n: string;
  title: string;
  body: string;
  tags: string[];
}
export interface PracticeProcessStep {
  n: string;
  title: string;
  duration: string;
  body: string;
}
export interface PracticeMetric {
  v: string;
  u: string;
  l: string;
}
export interface PracticeFaq {
  q: string;
  a: string;
}
export interface PracticeContact {
  address: string;
  email: string;
  site: string;
  hours: string;
}
export interface Practice {
  name: string;
  shortName: string;
  practice: string;
  location: string;
  format: string;
  established: string;
  status: string;
  heroEyebrow: string;
  heroLeads: string[];
  heroSub: string;
  positioning: PracticePositioning[];
  bio: string[];
  credentials: PracticeCredential[];
  specialties: PracticeSpecialty[];
  process: PracticeProcessStep[];
  metrics: PracticeMetric[];
  faqs: PracticeFaq[];
  contact: PracticeContact;
  // Overridden by the loader to a blob: URL after the portrait file
  // is fetched from Storage. May be empty string if the fetch failed.
  portrait: string;
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
