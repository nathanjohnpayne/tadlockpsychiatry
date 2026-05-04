// Shared content for Dr. Sterling Tadlock—Psychiatry.
// All three directions read from this single source so copy stays
// consistent.
//
// Phase 4 (#24) of the Vite migration: the build now bundles this
// file with esbuild (`bundle: true, format: "esm"`) into
// dist-protected/content.js. The runtime loader fetches the bundle
// as a Blob, mints a blob URL, dynamic-imports it, and reads the
// default export. The legacy window.PRACTICE global is gone.
import type { Practice } from "../src/types";

const PRACTICE: Practice = {
  name: "Sterling Tadlock, M.D.",
  shortName: "S. Tadlock",
  practice: "Performance Psychiatry",
  location: "Jackson Square · San Francisco",
  format: "In-person consultation",
  established: "Est. 2026",
  status: "Now accepting a limited number of new patients",

  // Hero phrasing—declarative, evidence-forward, restrained.
  heroEyebrow: "Psychiatry · San Francisco",
  heroLeads: [
    "Psychiatry for people whose work depends on a clear mind.",
    "A psychiatry practice for the moments your performance depends on.",
    "Clinical psychiatry, applied to the architecture of high performance.",
  ],
  heroSub:
    "A private practice integrating evidence-based psychiatry with performance psychology—built for athletes, artists, executives, and the people whose work doesn't allow for a foggy day.",

  positioning: [
    {
      k: "01",
      h: "Beyond symptom management",
      p: "Most psychiatry stops at the absence of distress. We treat that as the floor—and build from there toward sustained cognitive performance, emotional regulation, and resilience under load.",
    },
    {
      k: "02",
      h: "Designed for high-stakes work",
      p: "Care is calibrated for environments where the cost of a bad week is measurable: a board meeting, a tour, a season, a launch. The clinical model is built around that asymmetry.",
    },
    {
      k: "03",
      h: "Integrative by design",
      p: "Psychiatric evaluation, medication management when indicated, and tailored therapeutic technique—combined, not stacked. Each modality earns its place in the plan.",
    },
  ],

  // About—bio + credentials.
  bio: [
    "Dr. Sterling Tadlock is a psychiatrist practicing in San Francisco. His work sits at the intersection of clinical psychiatry and performance psychology—a discipline focused on the cognitive, emotional, and physiological systems that determine how people perform when the stakes are highest.",
    "He trained at Duke, the University of North Carolina School of Medicine, and the University of California, San Francisco. His practice integrates traditional psychiatric care with performance-oriented modalities to address burnout, anxiety, attention, and the long arc of sustained high output.",
  ],
  credentials: [
    { era: "Residency", school: "University of California, San Francisco", years: "Psychiatry" },
    { era: "Medical School", school: "University of North Carolina at Chapel Hill", years: "Doctor of Medicine" },
    { era: "Undergraduate", school: "Duke University", years: "Pre-medical studies" },
  ],

  // Specialties / focus areas.
  specialties: [
    {
      n: "01",
      title: "ADHD & Executive Functioning",
      body: "Diagnostic clarity, cognitive scaffolding, and pharmacologic strategy for adults whose attentional architecture has to hold under pressure. Calibrated to high-output professional contexts.",
      tags: ["Adult ADHD", "Executive function", "Cognitive load"],
    },
    {
      n: "02",
      title: "Performance Psychiatry",
      body: "For athletes, performers, founders, and operators. Mental agility, emotional regulation, and recovery—engineered against the demands of competition and the public-facing edge of a career.",
      tags: ["Pre-event preparation", "Recovery cycles", "Identity & role"],
    },
    {
      n: "03",
      title: "Burnout & Resilience",
      body: "Burnout is rarely just exhaustion. It's a structural mismatch between demand and recovery. The work is to redesign the system, not patch the symptoms—clinically, behaviorally, and where useful, pharmacologically.",
      tags: ["Sustained output", "Recovery design", "Anxiety"],
    },
    {
      n: "04",
      title: "Ketamine-Assisted Therapy",
      body: "Where indicated, a structured course of ketamine-assisted treatment integrated into a broader therapeutic plan. Conservative, evidence-led, and never a standalone product.",
      tags: ["Treatment-resistant depression", "Integration", "Protocol-driven"],
    },
  ],

  // What to expect—first-session walkthrough.
  process: [
    {
      n: "I",
      title: "Initial consultation",
      duration: "75 min",
      body: "An unhurried first session. We map history, current functioning, the demands of your work, and what 'good' would actually look like—measured against your life, not a textbook.",
    },
    {
      n: "II",
      title: "Formulation",
      duration: "Within one week",
      body: "A written clinical formulation: what's happening, what's driving it, and a treatment plan with explicit hypotheses, modalities, and decision points. You leave with a document, not a vague impression.",
    },
    {
      n: "III",
      title: "Treatment & calibration",
      duration: "Ongoing",
      body: "Sessions cadenced to the work—weekly, biweekly, or as the plan calls for. Medication, therapy, and performance modalities are revised based on data, not inertia.",
    },
    {
      n: "IV",
      title: "Maintenance",
      duration: "Long arc",
      body: "Once stable, care moves to a maintenance rhythm: periodic check-ins, on-call access during high-load periods, and structured recalibration when the system changes.",
    },
  ],

  // Numbers shown sparingly, where they earn their place.
  metrics: [
    { v: "75", u: "min", l: "Initial consultation" },
    { v: "1:1", u: "", l: "No associates, ever" },
    { v: "≤ 24h", u: "", l: "Response window for established patients" },
  ],

  faqs: [
    { q: "Do you accept insurance?", a: "The practice operates out-of-network. Detailed superbills are provided for patients seeking PPO reimbursement." },
    { q: "Is this telehealth or in-person?", a: "In-person, at the Jackson Square office. Continuity sessions are available by secure video for established patients." },
    { q: "Are you taking new patients?", a: "A limited number, by application. The waitlist below is the entry point." },
  ],

  contact: {
    address: "Jackson Square, San Francisco",
    email: "office@tadlockpsychiatry.com",
    site: "tadlockpsychiatry.com",
    hours: "By appointment",
  },
  portrait: "/assets/sterling-tadlock.png",
};

export default PRACTICE;
