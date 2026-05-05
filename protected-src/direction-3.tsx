// Direction 3 — Architectural Performance
// High-contrast brutalist-leaning. Massive sans display, generative line-grid
// that responds to cursor, monospace metadata. Bold blocks, hard divisions,
// information-dense.
//
// Phase 5 (#25) — see direction-1.tsx header for the theme/useViewport
// rationale. Phase 4 (#24) DirectionMount contract unchanged.
import React, { createElement } from "react";
import { createRoot } from "react-dom/client";
import type { DirectionComponent, DirectionMount } from "../src/types";
import { getD3Theme } from "./d3/theme";
import {
  useViewport,
  collapseGridColumns,
  collapseGridGap,
  h1FontSize,
  h1LineHeight,
  h2FontSize,
  h3FontSize,
  sectionPadding,
} from "./shared/use-viewport";

const D3: DirectionComponent = ({ tweaks, practice: P }) => {
  const t = getD3Theme(tweaks);
  const { bg, fg, dim, faint, card, inv, accent, sans, mono, dark, heroVariant } = t;
  const { bp } = useViewport();

  const rootRef = React.useRef<any>(null);
  const gridRef = React.useRef<any>(null);
  const [mouse, setMouse] = React.useState({ x: 0.5, y: 0.5 });

  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const onMove = (e: any) => {
      const r = root.getBoundingClientRect();
      const mx = (e.clientX - r.left) / r.width;
      const my = (e.clientY - r.top) / r.height;
      setMouse({ x: mx, y: my });
      if (gridRef.current) {
        gridRef.current.style.setProperty("--mx", mx);
        gridRef.current.style.setProperty("--my", my);
      }
    };
    root.addEventListener("mousemove", onMove);
    return () => root.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div ref={rootRef} className="d-root" style={{
      width: "100%", height: "100%", overflow: "auto",
      background: bg, color: fg, fontFamily: sans,
      scrollbarWidth: "thin", scrollbarColor: `${faint} transparent`,
    }}>
      <NavBarD3 bp={bp} fg={fg} dim={dim} faint={faint} accent={accent} mono={mono} bg={bg} />
      <HeroD3 bp={bp} P={P} fg={fg} dim={dim} faint={faint} accent={accent} mono={mono} card={card} bg={bg} inv={inv}
        gridRef={gridRef} variant={heroVariant} mouse={mouse} dark={dark} />
      <PrincipleD3 bp={bp} P={P} fg={fg} dim={dim} faint={faint} accent={accent} mono={mono} card={card} />
      <SpecialtiesD3 bp={bp} P={P} fg={fg} dim={dim} faint={faint} accent={accent} mono={mono} card={card} />
      <ProcessD3 bp={bp} P={P} fg={fg} dim={dim} faint={faint} accent={accent} mono={mono} card={card} inv={inv} />
      <AboutD3 bp={bp} P={P} fg={fg} dim={dim} faint={faint} accent={accent} mono={mono} card={card} />
      <WaitlistD3 bp={bp} P={P} fg={fg} dim={dim} faint={faint} accent={accent} mono={mono} bg={bg} inv={inv} />
      <FooterD3 bp={bp} P={P} fg={fg} dim={dim} faint={faint} accent={accent} mono={mono} />
    </div>
  );
};

const NavBarD3 = ({ fg, dim, faint, accent, mono, bg, bp }: any) => (
  <nav style={{
    position: "sticky", top: 0, zIndex: 10,
    padding: "14px 32px", display: "grid", gridTemplateColumns: collapseGridColumns(bp, "1fr 1fr 1fr"),
    alignItems: "center",
    background: bg, borderBottom: `1px solid ${fg}`,
    fontFamily: mono, fontSize: 11.5, letterSpacing: 0.6, textTransform: "uppercase",
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: collapseGridGap(bp, 12) }}>
      <div style={{ width: 14, height: 14, background: accent }} />
      <span style={{ fontWeight: 700 }}>TADLOCK / PSYCHIATRY</span>
    </div>
    <div style={{ display: "flex", justifyContent: "center", gap: 28 }}>
      <a style={{ color: fg, textDecoration: "none", cursor: "pointer" }}>[01] Practice</a>
      <a style={{ color: dim, textDecoration: "none", cursor: "pointer" }}>[02] Specialties</a>
      <a style={{ color: dim, textDecoration: "none", cursor: "pointer" }}>[03] Process</a>
      <a style={{ color: dim, textDecoration: "none", cursor: "pointer" }}>[04] About</a>
    </div>
    <div style={{ display: "flex", justifyContent: "flex-end", gap: 18, alignItems: "center" }}>
      <span style={{ color: dim }}>SF · 37.7951°N</span>
      <button style={{
        padding: "8px 14px", background: accent, color: "#0A0A0A", border: "none",
        fontFamily: mono, fontSize: 11, letterSpacing: 0.6, textTransform: "uppercase", fontWeight: 700, cursor: "pointer",
      }}>Apply →</button>
    </div>
  </nav>
);

const HeroD3 = ({ P, fg, dim, faint, accent, mono, card, bg, inv, gridRef, variant, mouse, dark, bp }: any) => {
  if (variant === "manifesto") return <HeroD3Manifesto bp={bp} P={P} fg={fg} dim={dim} faint={faint} accent={accent} mono={mono} card={card} inv={inv} />;
  if (variant === "stats") return <HeroD3Stats bp={bp} P={P} fg={fg} dim={dim} faint={faint} accent={accent} mono={mono} card={card} inv={inv} />;
  return <HeroD3Blocks bp={bp} P={P} fg={fg} dim={dim} faint={faint} accent={accent} mono={mono} card={card} bg={bg} inv={inv} gridRef={gridRef} mouse={mouse} dark={dark} />;
};

const HeroD3Blocks = ({ P, fg, dim, faint, accent, mono, card, bg, inv, gridRef, mouse, dark, bp }: any) => (
  <section style={{ position: "relative", borderBottom: `1px solid ${fg}` }}>
    {/* generative line-grid that follows the cursor */}
    <div ref={gridRef} style={{
      position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden",
      // CSS custom properties aren't in React.CSSProperties; cast around it.
      ["--mx" as string]: 0.5,
      ["--my" as string]: 0.5,
    } as React.CSSProperties}>
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: dark ? 0.18 : 0.12 }}>
        <defs>
          <pattern id="d3grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke={fg} strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#d3grid)" />
      </svg>
      {/* radial mask following cursor */}
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(380px circle at calc(var(--mx) * 100%) calc(var(--my) * 100%), ${accent}30, transparent 60%)`,
        transition: "background 0.15s linear",
      }} />
    </div>

    <div style={{
      position: "relative", display: "grid",
      gridTemplateColumns: collapseGridColumns(bp, "1.5fr 1fr"), borderBottom: `1px solid ${fg}`,
    }}>
      <div style={{ padding: sectionPadding(bp, "60px 40px 40px"), borderRight: `1px solid ${fg}` }}>
        <div style={{ fontFamily: mono, fontSize: 11, color: dim, letterSpacing: 1, textTransform: "uppercase", marginBottom: 28, display: "flex", justifyContent: "space-between" }}>
          <span>FILE—INTRODUCTION / V0.1</span>
          <span>{P.established}</span>
        </div>
        <h1 style={{
          fontWeight: 800, fontSize: h1FontSize(bp, "clamp(60px, 8.4vw, 156px)"), lineHeight: h1LineHeight(bp, 0.86),
          letterSpacing: -5, margin: 0, textTransform: "uppercase", textWrap: "balance",
        }}>
          Psychiatry<br />for a <span style={{ color: accent }}>clear</span><br />mind.
        </h1>
      </div>
      <div style={{
        padding: sectionPadding(bp, "60px 40px 40px"), display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 32,
      }}>
        <div style={{ fontFamily: mono, fontSize: 11, color: accent, letterSpacing: 1, textTransform: "uppercase" }}>
          ▦ Mission
        </div>
        <p style={{ fontSize: 18, lineHeight: 1.5, color: fg, margin: 0, fontWeight: 500, letterSpacing: -0.1, textWrap: "pretty" }}>
          {P.heroSub}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 0, border: `1px solid ${fg}` }}>
          <button style={{
            padding: "16px 20px", background: fg, color: inv, border: "none",
            fontFamily: mono, fontSize: 12, letterSpacing: 0.8, textTransform: "uppercase", fontWeight: 700, cursor: "pointer",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <span>Request a consultation</span><span>→</span>
          </button>
          <button style={{
            padding: "16px 20px", background: "transparent", color: fg, border: "none", borderTop: `1px solid ${fg}`,
            fontFamily: mono, fontSize: 12, letterSpacing: 0.8, textTransform: "uppercase", fontWeight: 600, cursor: "pointer",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <span>Read the practice brief</span><span>↗</span>
          </button>
        </div>
      </div>
    </div>

    {/* metric strip */}
    <div style={{ position: "relative", display: "grid", gridTemplateColumns: collapseGridColumns(bp, "repeat(4, 1fr)") }}>
      {[
        { l: "Established", v: "MMXXVI" },
        { l: "Discipline", v: "Psychiatry" },
        { l: "Method", v: "Performance" },
        { l: "Status", v: "Open · Limited" },
      ].map((m, i) => (
        <div key={m.l} style={{
          padding: "18px 24px", borderRight: i < 3 ? `1px solid ${fg}` : "none",
          display: "flex", justifyContent: "space-between", alignItems: "baseline",
          background: bg,
        }}>
          <span style={{ fontFamily: mono, fontSize: 10.5, color: dim, letterSpacing: 1, textTransform: "uppercase" }}>{m.l}</span>
          <span style={{ fontFamily: mono, fontSize: 13, fontWeight: 700, letterSpacing: 0.2 }}>{m.v}</span>
        </div>
      ))}
    </div>
  </section>
);

const HeroD3Manifesto = ({ P, fg, dim, accent, mono, card, inv, bp }: any) => (
  <section style={{ padding: sectionPadding(bp, "80px 40px 60px"), borderBottom: `1px solid ${fg}` }}>
    <div style={{ fontFamily: mono, fontSize: 11, color: accent, letterSpacing: 1, textTransform: "uppercase", marginBottom: 40 }}>
      ▦ Manifesto · {P.heroEyebrow}
    </div>
    <h1 style={{
      fontWeight: 800, fontSize: h1FontSize(bp, "clamp(48px, 6.4vw, 120px)"), lineHeight: h1LineHeight(bp, 0.92),
      letterSpacing: -3.4, margin: 0, textTransform: "uppercase", textWrap: "balance", maxWidth: 1500,
    }}>
      Most psychiatry treats absence<br />of distress as the <span style={{ color: accent }}>goal</span>.<br />We treat it as the floor.
    </h1>
    <div style={{ marginTop: 56, display: "grid", gridTemplateColumns: collapseGridColumns(bp, "1fr 1fr"), gap: collapseGridGap(bp, 60) }}>
      <p style={{ fontSize: 18, lineHeight: 1.55, color: fg, margin: 0, fontWeight: 500, textWrap: "pretty" }}>{P.heroSub}</p>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "flex-end" }}>
        <button style={{
          padding: "16px 22px", background: accent, color: "#0A0A0A", border: "none",
          fontFamily: mono, fontSize: 12.5, letterSpacing: 0.8, textTransform: "uppercase", fontWeight: 700, cursor: "pointer",
        }}>Apply →</button>
      </div>
    </div>
  </section>
);

const HeroD3Stats = ({ P, fg, dim, faint, accent, mono, card, inv, bp }: any) => (
  <section style={{ padding: sectionPadding(bp, "60px 40px 40px"), borderBottom: `1px solid ${fg}`, position: "relative" }}>
    <div style={{ fontFamily: mono, fontSize: 11, color: accent, letterSpacing: 1, textTransform: "uppercase", marginBottom: 32 }}>
      ▦ Practice Profile · {P.established}
    </div>
    <h1 style={{
      fontWeight: 800, fontSize: h1FontSize(bp, "clamp(44px, 6vw, 108px)"), lineHeight: h1LineHeight(bp, 0.94),
      letterSpacing: -3, margin: 0, textTransform: "uppercase", maxWidth: 1500, textWrap: "balance",
    }}>
      Clinical psychiatry,<br />applied to <span style={{ color: accent }}>high performance</span>.
    </h1>
    <div style={{ marginTop: 48, display: "grid", gridTemplateColumns: collapseGridColumns(bp, "repeat(3, 1fr)"), border: `1px solid ${fg}` }}>
      {P.metrics.map((m, i) => (
        <div key={m.l} style={{ padding: "32px 28px", borderRight: i < 2 ? `1px solid ${fg}` : "none" }}>
          <div style={{ fontFamily: mono, fontSize: 11, color: dim, letterSpacing: 1, textTransform: "uppercase", marginBottom: 16 }}>0{i + 1}</div>
          <div style={{ fontFamily: mono, fontSize: 56, fontWeight: 800, letterSpacing: -2 }}>
            {m.v}<span style={{ color: dim, fontSize: 28 }}>{m.u}</span>
          </div>
          <div style={{ fontSize: 14, color: dim, marginTop: 8 }}>{m.l}</div>
        </div>
      ))}
    </div>
  </section>
);

const PrincipleD3 = ({ P, fg, dim, faint, accent, mono, card, bp }: any) => (
  <section style={{ padding: sectionPadding(bp, "60px 40px"), borderBottom: `1px solid ${fg}` }}>
    <div style={{ display: "grid", gridTemplateColumns: collapseGridColumns(bp, "240px 1fr"), gap: collapseGridGap(bp, 40), marginBottom: 40 }}>
      <div style={{ fontFamily: mono, fontSize: 11, color: accent, letterSpacing: 1, textTransform: "uppercase" }}>
        § 01<br /><span style={{ color: dim, marginTop: 4, display: "block" }}>Premise</span>
      </div>
      <h2 style={{
        fontWeight: 800, fontSize: h2FontSize(bp, "clamp(36px, 4.6vw, 72px)"), lineHeight: 0.96,
        letterSpacing: -2, margin: 0, textTransform: "uppercase", textWrap: "balance",
      }}>
        Three principles<br />define the work.
      </h2>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: collapseGridColumns(bp, "repeat(3, 1fr)"), border: `1px solid ${fg}` }}>
      {P.positioning.map((c, i) => (
        <div key={c.k} style={{
          padding: 32, borderRight: i < 2 ? `1px solid ${fg}` : "none", background: card, position: "relative",
        }}>
          <div style={{ fontFamily: mono, fontSize: 64, fontWeight: 800, color: accent, letterSpacing: -2, marginBottom: 24, lineHeight: 1 }}>
            {c.k}
          </div>
          <div style={{ height: 1, background: fg, marginBottom: 20 }} />
          <h3 style={{ fontSize: h3FontSize(bp, 22), fontWeight: 700, letterSpacing: -0.5, margin: "0 0 14px", textTransform: "uppercase" }}>{c.h}</h3>
          <p style={{ fontSize: 14.5, lineHeight: 1.6, color: dim, margin: 0 }}>{c.p}</p>
        </div>
      ))}
    </div>
  </section>
);

const SpecialtiesD3 = ({ P, fg, dim, faint, accent, mono, card, bp }: any) => {
  const [hover, setHover] = React.useState(null);
  return (
    <section style={{ padding: sectionPadding(bp, "60px 40px"), borderBottom: `1px solid ${fg}` }}>
      <div style={{ display: "grid", gridTemplateColumns: collapseGridColumns(bp, "240px 1fr"), gap: collapseGridGap(bp, 40), marginBottom: 40, alignItems: "end" }}>
        <div style={{ fontFamily: mono, fontSize: 11, color: accent, letterSpacing: 1, textTransform: "uppercase" }}>
          § 02<br /><span style={{ color: dim, marginTop: 4, display: "block" }}>Specialties</span>
        </div>
        <h2 style={{
          fontWeight: 800, fontSize: h2FontSize(bp, "clamp(36px, 4.6vw, 72px)"), lineHeight: 0.96,
          letterSpacing: -2, margin: 0, textTransform: "uppercase", textWrap: "balance",
        }}>
          Four practices.<br />One method.
        </h2>
      </div>

      <div style={{ border: `1px solid ${fg}` }}>
        {P.specialties.map((s, i) => (
          <div key={s.n}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            style={{
              display: "grid", gridTemplateColumns: collapseGridColumns(bp, "120px 1.4fr 2fr 240px"),
              gap: collapseGridGap(bp, 32), padding: "28px 32px",
              borderTop: i > 0 ? `1px solid ${fg}` : "none",
              alignItems: "center", cursor: "pointer", position: "relative",
              background: hover === i ? accent : "transparent",
              color: hover === i ? "#0A0A0A" : fg,
              transition: "background 0.2s, color 0.2s",
            }}>
            <div style={{ fontFamily: mono, fontSize: 32, fontWeight: 800, letterSpacing: -1, opacity: hover === i ? 1 : 0.5 }}>{s.n}</div>
            <h3 style={{ fontSize: h3FontSize(bp, 28), fontWeight: 700, letterSpacing: -0.6, margin: 0, textTransform: "uppercase", lineHeight: 1.05 }}>{s.title}</h3>
            <p style={{ fontSize: 14.5, lineHeight: 1.55, margin: 0, color: hover === i ? "#0A0A0A" : dim }}>{s.body}</p>
            <div style={{ textAlign: "right", fontFamily: mono, fontSize: 11, letterSpacing: 0.6, textTransform: "uppercase" }}>
              {hover === i ? "▶ View" : `→ 0${i + 1}`}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

const ProcessD3 = ({ P, fg, dim, faint, accent, mono, card, inv, bp }: any) => (
  <section style={{ padding: sectionPadding(bp, "60px 40px"), borderBottom: `1px solid ${fg}`, background: fg, color: inv }}>
    <div style={{ display: "grid", gridTemplateColumns: collapseGridColumns(bp, "240px 1fr"), gap: collapseGridGap(bp, 40), marginBottom: 48, alignItems: "end" }}>
      <div style={{ fontFamily: mono, fontSize: 11, color: accent, letterSpacing: 1, textTransform: "uppercase" }}>
        § 03<br /><span style={{ opacity: 0.6, marginTop: 4, display: "block" }}>Process</span>
      </div>
      <h2 style={{
        fontWeight: 800, fontSize: h2FontSize(bp, "clamp(36px, 4.6vw, 72px)"), lineHeight: 0.96,
        letterSpacing: -2, margin: 0, textTransform: "uppercase", textWrap: "balance",
      }}>
        Four phases.<br />One written plan.
      </h2>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: collapseGridColumns(bp, "repeat(4, 1fr)"), border: `1px solid ${inv}` }}>
      {P.process.map((p, i) => (
        <div key={p.n} style={{
          padding: 28, borderRight: i < 3 ? `1px solid ${inv}` : "none",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 24 }}>
            <span style={{ fontFamily: mono, fontSize: 11, color: accent, letterSpacing: 1 }}>PHASE {i + 1}</span>
            <span style={{ fontFamily: mono, fontSize: 10, opacity: 0.6, letterSpacing: 0.5 }}>{p.duration}</span>
          </div>
          <div style={{ fontFamily: mono, fontSize: 88, fontWeight: 800, letterSpacing: -3, lineHeight: 0.9, marginBottom: 24, color: accent }}>{p.n}</div>
          <h3 style={{ fontSize: h3FontSize(bp, 18), fontWeight: 700, letterSpacing: -0.3, margin: "0 0 12px", textTransform: "uppercase" }}>{p.title}</h3>
          <p style={{ fontSize: 13.5, lineHeight: 1.6, opacity: 0.7, margin: 0 }}>{p.body}</p>
        </div>
      ))}
    </div>
  </section>
);

const AboutD3 = ({ P, fg, dim, faint, accent, mono, card, bp }: any) => (
  <section style={{ padding: sectionPadding(bp, "60px 40px"), borderBottom: `1px solid ${fg}` }}>
    <div style={{ display: "grid", gridTemplateColumns: collapseGridColumns(bp, "240px 1fr"), gap: collapseGridGap(bp, 40), marginBottom: 40, alignItems: "end" }}>
      <div style={{ fontFamily: mono, fontSize: 11, color: accent, letterSpacing: 1, textTransform: "uppercase" }}>
        § 04<br /><span style={{ color: dim, marginTop: 4, display: "block" }}>About</span>
      </div>
      <h2 style={{
        fontWeight: 800, fontSize: h2FontSize(bp, "clamp(36px, 4.6vw, 72px)"), lineHeight: 0.96,
        letterSpacing: -2, margin: 0, textTransform: "uppercase", textWrap: "balance",
      }}>
        Sterling Tadlock,<br />M.D.
      </h2>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: collapseGridColumns(bp, "1fr 1.4fr"), border: `1px solid ${fg}` }}>
      <div style={{
        borderRight: `1px solid ${fg}`,
        position: "relative", aspectRatio: "1/1.1", overflow: "hidden",
        background: `#0A0A0A url(${P.portrait}) center/cover no-repeat`,
        filter: "contrast(1.04)",
      }}>
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, transparent 60%, rgba(10,10,10,0.5))`, pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 16, left: 16, fontFamily: mono, fontSize: 10, color: "#fff", letterSpacing: 1, textTransform: "uppercase" }}>
          S. TADLOCK, M.D.
        </div>
        <div style={{ position: "absolute", bottom: 16, right: 16, fontFamily: mono, fontSize: 10, color: "#fff", letterSpacing: 1, textTransform: "uppercase" }}>
          FIG. I
        </div>
      </div>
      <div style={{ padding: 40 }}>
        {P.bio.map((b, i) => (
          <p key={i} style={{ fontSize: 16, lineHeight: 1.65, color: i === 0 ? fg : dim, margin: i > 0 ? "20px 0 0" : 0, fontWeight: i === 0 ? 500 : 400 }}>{b}</p>
        ))}
        <div style={{ marginTop: 36, paddingTop: 28, borderTop: `1px solid ${fg}` }}>
          <div style={{ fontFamily: mono, fontSize: 10.5, color: accent, letterSpacing: 1, textTransform: "uppercase", marginBottom: 18 }}>
            Training & credentials
          </div>
          {P.credentials.map((c, i) => (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: collapseGridColumns(bp, "160px 1fr 200px"),
              gap: collapseGridGap(bp, 16), padding: "14px 0",
              borderTop: i > 0 ? `1px solid ${faint}` : "none", alignItems: "baseline",
            }}>
              <div style={{ fontFamily: mono, fontSize: 11, color: dim, letterSpacing: 0.6, textTransform: "uppercase" }}>{c.era}</div>
              <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: -0.2, textTransform: "uppercase" }}>{c.school}</div>
              <div style={{ fontFamily: mono, fontSize: 11.5, color: dim, textAlign: "right", letterSpacing: 0.4 }}>{c.years}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

const WaitlistD3 = ({ P, fg, dim, faint, accent, mono, bg, inv, bp }: any) => {
  const [email, setEmail] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);
  return (
    <section style={{ padding: sectionPadding(bp, "80px 40px"), borderBottom: `1px solid ${fg}`, background: accent, color: "#0A0A0A" }}>
      <div style={{ display: "grid", gridTemplateColumns: collapseGridColumns(bp, "1.4fr 1fr"), gap: collapseGridGap(bp, 60), alignItems: "end" }}>
        <div>
          <div style={{ fontFamily: mono, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", marginBottom: 32, fontWeight: 700 }}>
            ▦ Apply · By application only · {P.location}
          </div>
          <h2 style={{
            fontWeight: 800, fontSize: h2FontSize(bp, "clamp(48px, 7vw, 132px)"), lineHeight: 0.88,
            letterSpacing: -4, margin: 0, textTransform: "uppercase", textWrap: "balance",
          }}>
            The work begins<br />with a conversation.
          </h2>
        </div>
        <div>
          {!submitted ? (
            <form onSubmit={(e: any) => { e.preventDefault(); if (email) setSubmitted(true); }}
              style={{ border: "1px solid #0A0A0A" }}>
              <div style={{ padding: "16px 18px", borderBottom: "1px solid #0A0A0A" }}>
                <label style={{ fontFamily: mono, fontSize: 10, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 6, fontWeight: 700 }}>Email</label>
                <input type="email" required value={email} onChange={(e: any) => setEmail(e.target.value)} placeholder="you@domain.com"
                  style={{
                    width: "100%", padding: 0, border: "none", background: "transparent",
                    color: "#0A0A0A", fontSize: 16, fontFamily: mono, outline: "none", boxSizing: "border-box",
                  }} />
              </div>
              <button type="submit" style={{
                width: "100%", padding: "18px 22px", border: "none", background: "#0A0A0A", color: accent,
                fontFamily: mono, fontSize: 13, letterSpacing: 1, textTransform: "uppercase", fontWeight: 800, cursor: "pointer",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <span>Begin application</span><span>→</span>
              </button>
            </form>
          ) : (
            <div style={{ padding: 28, border: "2px solid #0A0A0A", fontFamily: mono, fontSize: 13, letterSpacing: 0.6, fontWeight: 700, textTransform: "uppercase" }}>
              ✓ Application received<br />
              <span style={{ fontWeight: 400, textTransform: "none" }}>We'll be in touch within two business days.</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

const FooterD3 = ({ P, fg, dim, faint, accent, mono, bp }: any) => (
  <footer style={{ padding: "32px 40px", borderTop: `1px solid ${fg}`, fontFamily: mono, fontSize: 11.5, letterSpacing: 0.4 }}>
    <div style={{ display: "grid", gridTemplateColumns: collapseGridColumns(bp, "repeat(4, 1fr)"), gap: collapseGridGap(bp, 32), marginBottom: 32 }}>
      <div>
        <div style={{ fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>TADLOCK / PSYCHIATRY</div>
        <div style={{ color: dim, lineHeight: 1.55 }}>{P.practice}</div>
      </div>
      <div>
        <div style={{ color: dim, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Office</div>
        <div>{P.contact.address}</div>
        <div style={{ color: dim }}>{P.contact.hours}</div>
      </div>
      <div>
        <div style={{ color: dim, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Contact</div>
        <div>{P.contact.email}</div>
      </div>
      <div>
        <div style={{ color: dim, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Notice</div>
        <div style={{ color: dim }}>If in crisis, call 988</div>
      </div>
    </div>
    <div style={{ borderTop: `1px solid ${fg}`, paddingTop: 18, display: "flex", justifyContent: "space-between", textTransform: "uppercase", letterSpacing: 1, color: dim }}>
      <span>© 2026—TADLOCK PSYCHIATRY, LLC</span>
      <span>SITE V0.1 / {P.established}</span>
    </div>
  </footer>
);

const mount: DirectionMount = (rootEl, props) => {
  createRoot(rootEl).render(createElement(D3, props));
};

export default mount;
