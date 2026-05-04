// Shared types across the public surface and the protected direction
// modules. Imported by both src/* (loader) and protected-src/*
// (content + direction components).
//
// Runtime contract since phase 4 (#24):
//
//   1. content.js exports default a Practice object.
//   2. direction-{1,2,3}.js export default a DirectionMount function
//      that owns its own React + ReactDOM and renders a
//      DirectionComponent into the supplied root element.
//
// The legacy phase-3 window.PRACTICE / window.D{N} globals are gone.
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

// DirectionComponent — the React component shape inside each
// protected-src/direction-{1,2,3}.tsx. NOT the default export of the
// built module today; see DirectionMount.
export type DirectionComponent = ComponentType<{
  tweaks: Tweaks;
  practice: Practice;
}>;

// DirectionMount — the shape of the default export from each built
// dist-protected/direction-{1,2,3}.js module.
//
// Phase 4 originally exported the React component itself and let the
// loader call createRoot + createElement against it. That broke at
// runtime: the loader's react-dom (npm-bundled into the loader chunk)
// and the protected module's react (npm-bundled into the protected
// chunk) were two distinct React instances, so hook dispatch failed
// with "Cannot read properties of null (reading 'useRef')". See
// Codex's P1 finding on PR #33.
//
// The fix is to make each protected module fully self-contained:
// it owns React + react-dom, and exports a mount function the loader
// calls with a target element + props. The loader stops importing any
// React-related package — it's now a pure orchestrator (auth + fetch +
// hand-off).
export type DirectionMount = (
  rootEl: HTMLElement,
  props: { tweaks: Tweaks; practice: Practice },
) => void;
