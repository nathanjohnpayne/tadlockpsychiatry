// Shared accessibility helpers for the direction prototypes.
//
// The prototypes are inline-styled, and inline styles cannot express
// pseudo-classes, so keyboard focus rings are injected as one scoped
// <style> element per direction root (`.d-root`). Controls must NOT set
// `outline: "none"` inline, or the inline style would win over this rule.
//
// Callers pass the direction's foreground color: it is the page's text
// color, so it contrasts with the page background in both dark and light
// themes (an accent ring can fall below 3:1, e.g. D3 light's orange on
// #EFEDE7). `.d-on-accent` marks regions whose background IS the accent
// color (the D3 waitlist band), where the ring is forced to near-black.

export const FocusStyles = ({ color }: { color: string }) => (
  <style>{`
.d-root :focus-visible { outline: 2px solid ${color}; outline-offset: 3px; }
.d-root .d-on-accent :focus-visible { outline-color: #0A0A0A; }
.d-root [id] { scroll-margin-top: 80px; }
`}</style>
);

// Section anchors the nav links and "Request consult" CTAs point at.
// Strips D3's "[01] " index prefix so every direction shares the same ids.
export const sectionId = (label: string) =>
  label.replace(/^\[\d+\]\s*/, "").toLowerCase().replace(/[^a-z0-9]+/g, "-");
export const APPLY_ID = "apply";

// Copy for the non-submitting waitlist/application forms. The prototypes
// have no backend; never show a "received" confirmation for input that is
// discarded.
export const PREVIEW_FORM_NOTE = "Preview only—this form does not submit. Nothing you enter is sent or saved.";
export const PREVIEW_FORM_ATTEMPT = "Preview only—nothing was sent. This prototype form is not connected to the practice.";
