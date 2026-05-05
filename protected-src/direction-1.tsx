// Direction 1—Editorial Noir
// Dark obsidian + warm gold accent. Serif display (Fraunces alt, but we use
// a tighter contemporary serif), clinical sans body. Cinematic ambient
// grain, cursor-tracked spotlight, parallax scroll on hero glyph.
//
// Phase 5 (#25): tokens extracted to ./d1/theme.ts; responsive
// behavior now lives in React via useViewport() instead of the
// src/direction-responsive.css attribute-selector overlay.
// Sub-components receive `bp` as a prop and write the responsive
// value inline (sectionPadding, collapseGridColumns, capHeroFontSize
// helpers in ./shared/use-viewport.ts). Phase 6 (#26) lands #11's
// direction-specific refinements (hamburger nav, D1 marquee cap,
// D3 metrics row 4/2/1) on top of this foundation. Internal sub-
// components keep `: any` props for minimal phase-5 churn.
//
// Phase 4 (#24) contract: this file's default export is a
// DirectionMount function — the loader calls
// `mount(rootEl, { tweaks, practice })` and the module owns the React
// render path (React + ReactDOM inlined per protected module).
import React, { createElement } from "react";
import { createRoot } from "react-dom/client";
import type { DirectionComponent, DirectionMount } from "../src/types";
import { getD1Theme } from "./d1/theme";
import {
  useViewport,
  capHeroFontSize,
  collapseGridColumns,
  collapseGridGap,
  h1FontSize,
  h1LineHeight,
  h2FontSize,
  h3FontSize,
  sectionPadding,
} from "./shared/use-viewport";

const D1: DirectionComponent = ({ tweaks, practice: P }) => {
  const t = getD1Theme(tweaks);
  const { bg, fg, dim, faint, veryFaint, accent, serif, sans, mono, dark, heroVariant } = t;
  const { bp } = useViewport();

  const rootRef = React.useRef<any>(null);
  const spotRef = React.useRef<any>(null);
  const glyphRef = React.useRef<any>(null);
  const [scrollY, setScrollY] = React.useState(0);

  // Cursor-tracked spotlight + parallax on the monogram glyph.
  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const onMove = (e: any) => {
      const r = root.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      if (spotRef.current) {
        spotRef.current.style.background = `radial-gradient(600px circle at ${x}px ${y}px, ${accent}18, transparent 60%)`;
      }
      if (glyphRef.current) {
        const cx = (x / r.width - 0.5) * 18;
        const cy = (y / r.height - 0.5) * 18;
        glyphRef.current.style.transform = `translate(${cx}px, ${cy}px)`;
      }
    };
    const onScroll = () => setScrollY(root.scrollTop);
    root.addEventListener("mousemove", onMove);
    root.addEventListener("scroll", onScroll);
    return () => {
      root.removeEventListener("mousemove", onMove);
      root.removeEventListener("scroll", onScroll);
    };
  }, [accent]);

  const styles: Record<string, React.CSSProperties> = {
    root: {
      width: "100%",
      height: "100%",
      overflow: "auto",
      background: bg,
      color: fg,
      fontFamily: sans,
      position: "relative",
      scrollbarWidth: "thin",
      scrollbarColor: `${faint} transparent`,
    },
    spot: {
      position: "fixed",
      inset: 0,
      pointerEvents: "none",
      zIndex: 1,
      mixBlendMode: dark ? "screen" : "multiply",
    },
    grain: {
      position: "fixed",
      inset: 0,
      pointerEvents: "none",
      zIndex: 2,
      opacity: dark ? 0.06 : 0.04,
      backgroundImage:
        "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='2' seed='3'/><feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.4 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
    },
  };

  return (
    <div ref={rootRef} className="d-root" style={styles.root}>
      <div ref={spotRef} style={styles.spot} />
      <div style={styles.grain} />

      <NavBarD1 bp={bp} fg={fg} dim={dim} faint={faint} accent={accent} mono={mono} />

      <HeroD1 bp={bp}
        P={P}
        fg={fg} dim={dim} faint={faint} bg={bg} accent={accent}
        serif={serif} mono={mono}
        scrollY={scrollY} glyphRef={glyphRef} variant={heroVariant}
      />

      <PositioningD1 bp={bp} P={P} fg={fg} dim={dim} faint={faint} accent={accent} serif={serif} mono={mono} />

      <SpecialtiesD1 bp={bp} P={P} fg={fg} dim={dim} faint={faint} accent={accent} serif={serif} mono={mono} />

      <ProcessD1 bp={bp} P={P} fg={fg} dim={dim} faint={faint} veryFaint={veryFaint} accent={accent} serif={serif} mono={mono} />

      <AboutD1 bp={bp} P={P} fg={fg} dim={dim} faint={faint} accent={accent} serif={serif} mono={mono} />

      <WaitlistD1 bp={bp} P={P} fg={fg} dim={dim} faint={faint} bg={bg} accent={accent} serif={serif} mono={mono} />

      <FooterD1 bp={bp} P={P} fg={fg} dim={dim} faint={faint} accent={accent} serif={serif} mono={mono} />
    </div>
  );
};

const NavBarD1 = ({ fg, dim, faint, accent, mono, bp }: any) => {
  const [open, setOpen] = React.useState(false);
  const isMobile = bp === "mobile" || bp === "tablet";
  const links = ["Practice", "Specialties", "Process", "About"];
  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 10,
      padding: bp === "mobile" ? "14px 16px" : "20px 56px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      backdropFilter: "blur(20px) saturate(140%)",
      WebkitBackdropFilter: "blur(20px) saturate(140%)",
      borderBottom: `0.5px solid ${faint}`,
      background: "rgba(14,15,18,0.62)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 14,
          border: `1px solid ${accent}`, display: "grid", placeItems: "center",
          fontFamily: mono, fontSize: 11, color: accent, letterSpacing: 0.5,
        }}>ST</div>
        <div style={{ fontSize: 14, fontWeight: 500, letterSpacing: -0.1 }}>Sterling Tadlock, M.D.</div>
      </div>
      {isMobile ? (
        // Hamburger toggle (≤880px). Touch target 44×44 px, panel
        // expands below the nav with the same link list.
        <button type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          style={{
            width: 44, height: 44, padding: 0,
            display: "grid", placeItems: "center",
            background: "transparent", border: `1px solid ${faint}`,
            color: accent, cursor: "pointer", borderRadius: 4,
          }}
        >
          {open ? (
            <span style={{ fontFamily: mono, fontSize: 18, lineHeight: 1 }}>×</span>
          ) : (
            <span style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ width: 18, height: 1, background: accent }} />
              <span style={{ width: 18, height: 1, background: accent }} />
              <span style={{ width: 18, height: 1, background: accent }} />
            </span>
          )}
        </button>
      ) : (
        <>
          <div style={{ display: "flex", gap: 36, fontSize: 12.5, color: dim, fontFamily: mono, letterSpacing: 0.4, textTransform: "uppercase" }}>
            {links.map((l) => (
              <a key={l} style={{ color: "inherit", textDecoration: "none", cursor: "pointer" }}>{l}</a>
            ))}
          </div>
          <div style={{
            padding: "9px 18px", borderRadius: 999,
            border: `1px solid ${accent}`, color: accent,
            fontSize: 12.5, fontFamily: mono, letterSpacing: 0.4, textTransform: "uppercase",
            cursor: "pointer", transition: "all 0.2s",
          }}
          onMouseEnter={(e: any) => { e.currentTarget.style.background = accent; e.currentTarget.style.color = "#0E0F12"; }}
          onMouseLeave={(e: any) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = accent; }}>
            Request consult
          </div>
        </>
      )}
      {/* Mobile panel — slides down below the sticky nav. */}
      {isMobile && open && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0,
          background: "rgba(14,15,18,0.96)",
          backdropFilter: "blur(20px) saturate(140%)",
          WebkitBackdropFilter: "blur(20px) saturate(140%)",
          borderBottom: `0.5px solid ${faint}`,
          padding: "16px 16px 24px",
          display: "flex", flexDirection: "column", gap: 0,
        }}>
          {links.map((l) => (
            <a
              key={l}
              onClick={() => setOpen(false)}
              style={{
                display: "block",
                padding: "16px 0",
                color: dim, textDecoration: "none", cursor: "pointer",
                fontFamily: mono, fontSize: 13, letterSpacing: 0.4,
                textTransform: "uppercase",
                borderBottom: `0.5px solid ${faint}`,
                minHeight: 44,
              }}
            >{l}</a>
          ))}
          <a
            onClick={() => setOpen(false)}
            style={{
              marginTop: 16, padding: "12px 18px",
              border: `1px solid ${accent}`, color: accent,
              fontFamily: mono, fontSize: 12.5, letterSpacing: 0.4,
              textTransform: "uppercase", cursor: "pointer",
              textAlign: "center", textDecoration: "none",
              borderRadius: 999, minHeight: 44,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >Request consult</a>
        </div>
      )}
    </nav>
  );
};

const HeroD1 = ({ P, fg, dim, faint, bg, accent, serif, mono, scrollY, glyphRef, variant, bp }: any) => {
  if (variant === "split") return <HeroD1Split bp={bp} P={P} fg={fg} dim={dim} faint={faint} accent={accent} serif={serif} mono={mono} scrollY={scrollY} />;
  if (variant === "marquee") return <HeroD1Marquee bp={bp} P={P} fg={fg} dim={dim} faint={faint} accent={accent} serif={serif} mono={mono} scrollY={scrollY} />;
  return <HeroD1Monogram bp={bp} P={P} fg={fg} dim={dim} faint={faint} bg={bg} accent={accent} serif={serif} mono={mono} scrollY={scrollY} glyphRef={glyphRef} />;
};

const HeroD1Monogram = ({ P, fg, dim, faint, accent, serif, mono, scrollY, glyphRef, bp }: any) => (
  <section style={{
    position: "relative", padding: sectionPadding(bp, "120px 56px 140px"),
    // Desktop: tall cinematic hero with content vertically centered.
    // Mobile/tablet (#34 feedback): the 92vh + center-justify left a
    // big empty band above the eyebrow on tall phones (iPhone Pro
    // 402×874 etc.). Drop the minHeight + flex-center on small
    // viewports and let content flow from the top.
    minHeight: bp === "desktop" ? "92vh" : undefined,
    display: bp === "desktop" ? "flex" : "block",
    flexDirection: "column", justifyContent: "center",
    overflow: "hidden",
  }}>
    {/* parallax monogram */}
    <div ref={glyphRef} style={{
      position: "absolute", right: -120, top: "50%",
      transform: `translateY(calc(-50% + ${scrollY * -0.15}px))`,
      fontFamily: serif, fontSize: capHeroFontSize(bp, 720), fontWeight: 300,
      color: accent, opacity: 0.07, letterSpacing: -40,
      pointerEvents: "none", zIndex: 0, lineHeight: 0.8,
      transition: "transform 0.6s cubic-bezier(0.2,0.7,0.3,1)",
    }}>T</div>

    <div style={{ position: "relative", zIndex: 3, maxWidth: 1100 }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 14, marginBottom: 56,
        fontFamily: mono, fontSize: 11.5, color: dim, letterSpacing: 1.4, textTransform: "uppercase",
      }}>
        <span style={{ width: 32, height: 1, background: accent }} />
        <span>{P.heroEyebrow}</span>
        <span style={{ color: faint }}>·</span>
        <span style={{ color: accent }}>{P.established}</span>
      </div>

      <h1 style={{
        fontFamily: serif, fontWeight: 300,
        fontSize: h1FontSize(bp, "clamp(56px, 7.4vw, 124px)"), lineHeight: h1LineHeight(bp, 0.94),
        letterSpacing: -2.2, margin: 0, maxWidth: 1240,
        textWrap: "balance",
      }}>
        Psychiatry for people whose work depends on a <em style={{
          fontStyle: "italic", color: accent, fontWeight: 300,
        }}>clear mind.</em>
      </h1>

      <p style={{
        marginTop: 44, maxWidth: 640, fontSize: 18, lineHeight: 1.55,
        color: dim, fontWeight: 400,
      }}>
        {P.heroSub}
      </p>

      <div style={{ marginTop: 56, display: "flex", alignItems: "center", gap: 28 }}>
        <button style={{
          padding: "16px 30px", border: "none", background: accent, color: "#0E0F12",
          fontFamily: mono, fontSize: 12.5, letterSpacing: 1, textTransform: "uppercase",
          cursor: "pointer", fontWeight: 600,
        }}>Request a consultation</button>
        <a style={{
          color: fg, fontSize: 13, fontFamily: mono, letterSpacing: 1, textTransform: "uppercase",
          textDecoration: "none", borderBottom: `1px solid ${faint}`, paddingBottom: 4, cursor: "pointer",
        }}>Read the practice brief →</a>
      </div>
    </div>

    {/* status strip */}
    <div style={{
      position: "absolute", bottom: 56, left: 56, right: 56, zIndex: 3,
      display: "flex", alignItems: "flex-end", justifyContent: "space-between",
      borderTop: `0.5px solid ${faint}`, paddingTop: 24,
    }}>
      <div style={{ fontFamily: mono, fontSize: 11, color: dim, letterSpacing: 1, textTransform: "uppercase" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: 3, background: "#9FBE94", boxShadow: "0 0 12px #9FBE94" }} />
          <span style={{ color: fg }}>{P.status}</span>
        </div>
        <div>{P.location}  ·  {P.format}</div>
      </div>
      <div style={{
        fontFamily: mono, fontSize: 10, color: dim,
        letterSpacing: 1.2, textTransform: "uppercase", textAlign: "right",
      }}>
        <div>Scroll</div>
        <div style={{ marginTop: 4, fontSize: 14, color: accent }}>↓</div>
      </div>
    </div>
  </section>
);

const HeroD1Split = ({ P, fg, dim, faint, accent, serif, mono, bp }: any) => (
  <section style={{
    padding: sectionPadding(bp, "100px 56px"),
    display: "grid", gridTemplateColumns: collapseGridColumns(bp, "1.4fr 1fr"), gap: collapseGridGap(bp, 64),
    minHeight: "88vh", alignItems: "center", position: "relative", zIndex: 3,
  }}>
    <div>
      <div style={{ fontFamily: mono, fontSize: 11, color: accent, letterSpacing: 1.4, textTransform: "uppercase", marginBottom: 40 }}>
        {P.heroEyebrow} · {P.established}
      </div>
      <h1 style={{
        fontFamily: serif, fontWeight: 300, fontSize: h1FontSize(bp, "clamp(48px, 5.6vw, 92px)"),
        lineHeight: h1LineHeight(bp, 0.98), letterSpacing: -1.6, margin: 0, textWrap: "balance",
      }}>
        Clinical psychiatry, applied to the <em style={{ fontStyle: "italic", color: accent, fontWeight: 300 }}>architecture</em> of high performance.
      </h1>
      <p style={{ marginTop: 32, fontSize: 17, lineHeight: 1.55, color: dim, maxWidth: 540 }}>{P.heroSub}</p>
      <div style={{ marginTop: 40, display: "flex", gap: 24 }}>
        <button style={{
          padding: "14px 26px", border: "none", background: accent, color: "#0E0F12",
          fontFamily: mono, fontSize: 12, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer", fontWeight: 600,
        }}>Request a consult</button>
      </div>
    </div>
    <div style={{
      aspectRatio: "3/4", border: `1px solid ${faint}`, position: "relative", overflow: "hidden",
      background: `#1a1815 url(${P.portrait}) center/cover no-repeat`,
      filter: "saturate(0.85) contrast(1.05)",
    }}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, transparent 55%, rgba(14,15,18,0.55))`, pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: 16, left: 16, fontFamily: mono, fontSize: 10, color: "#fff", letterSpacing: 1.2, textTransform: "uppercase" }}>
        Portrait · Plate I
      </div>
      <div style={{ position: "absolute", bottom: 16, right: 16, fontFamily: mono, fontSize: 10, color: "#fff", letterSpacing: 1.2, textTransform: "uppercase" }}>
        S. Tadlock
      </div>
    </div>
  </section>
);

const HeroD1Marquee = ({ P, fg, dim, faint, accent, serif, mono, bp }: any) => (
  <section style={{ padding: "100px 0 80px", position: "relative", zIndex: 3, minHeight: "82vh" }}>
    <div style={{ padding: "0 56px", marginBottom: 64 }}>
      <div style={{ fontFamily: mono, fontSize: 11, color: accent, letterSpacing: 1.4, textTransform: "uppercase" }}>
        {P.heroEyebrow}
      </div>
    </div>
    {/* Marquee — per #11, mobile caps font-size at 56px and reduces
        the animation distance so the giant scrolling text doesn't
        blow past the viewport. The mobile keyframe translates -25%
        (vs the desktop -50%) because each glyph is much smaller and
        a -50% translate would overshoot the visible window in the
        same animation duration. */}
    <div style={{
      whiteSpace: "nowrap", overflow: "hidden",
      fontFamily: serif,
      fontSize: bp === "mobile" ? 56 : "clamp(72px, 12vw, 200px)",
      fontWeight: 300, lineHeight: 1,
      letterSpacing: bp === "mobile" ? -1 : -3,
    }}>
      <div style={{
        display: "inline-block",
        animation: bp === "mobile"
          ? "marqueeD1Mobile 38s linear infinite"
          : "marqueeD1 38s linear infinite",
        paddingLeft: bp === "mobile" ? 16 : 56,
      }}>
        Performance.&nbsp;<em style={{ fontStyle: "italic", color: accent }}>Resilience.</em>&nbsp;Recovery.&nbsp;<em style={{ fontStyle: "italic", color: accent }}>Clarity.</em>&nbsp;Performance.&nbsp;<em style={{ fontStyle: "italic", color: accent }}>Resilience.</em>&nbsp;Recovery.&nbsp;
      </div>
    </div>
    <style>{`
      @keyframes marqueeD1 { from { transform: translateX(0) } to { transform: translateX(-50%) } }
      @keyframes marqueeD1Mobile { from { transform: translateX(0) } to { transform: translateX(-25%) } }
    `}</style>
    <div style={{ padding: "80px 56px 0", display: "grid", gridTemplateColumns: collapseGridColumns(bp, "1fr 1fr"), gap: collapseGridGap(bp, 64) }}>
      <div>
        <p style={{ fontFamily: serif, fontSize: 30, lineHeight: 1.2, color: fg, fontWeight: 300, margin: 0, textWrap: "pretty" }}>
          A psychiatry practice for the moments your performance depends on.
        </p>
      </div>
      <div>
        <p style={{ fontSize: 16, lineHeight: 1.6, color: dim, margin: 0 }}>{P.heroSub}</p>
        <button style={{
          marginTop: 32, padding: "14px 26px", border: "none", background: accent, color: "#0E0F12",
          fontFamily: mono, fontSize: 12, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer", fontWeight: 600,
        }}>Request a consult</button>
      </div>
    </div>
  </section>
);

const PositioningD1 = ({ P, fg, dim, faint, accent, serif, mono, bp }: any) => (
  <section style={{ padding: sectionPadding(bp, "140px 56px 120px"), borderTop: `0.5px solid ${faint}`, position: "relative", zIndex: 3 }}>
    <div style={{ display: "grid", gridTemplateColumns: collapseGridColumns(bp, "1fr 2.4fr"), gap: collapseGridGap(bp, 80), marginBottom: 80, alignItems: "start" }}>
      <div style={{ fontFamily: mono, fontSize: 11, color: accent, letterSpacing: 1.4, textTransform: "uppercase" }}>
        § The premise
      </div>
      <h2 style={{
        fontFamily: serif, fontWeight: 300, fontSize: h2FontSize(bp, "clamp(40px, 4.4vw, 68px)"),
        lineHeight: 1.05, letterSpacing: -1, margin: 0, textWrap: "balance", maxWidth: 920,
      }}>
        Most psychiatry treats the <em style={{ fontStyle: "italic", color: accent, fontWeight: 300 }}>absence</em> of distress as the goal. We treat it as the floor.
      </h2>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: collapseGridColumns(bp, "repeat(3, 1fr)"), gap: collapseGridGap(bp, 56) }}>
      {P.positioning.map((c) => (
        <div key={c.k} style={{ borderTop: `1px solid ${faint}`, paddingTop: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 18 }}>
            <span style={{ fontFamily: mono, fontSize: 11, color: accent, letterSpacing: 1 }}>{c.k}</span>
            <span style={{ fontFamily: mono, fontSize: 10, color: dim, letterSpacing: 1, textTransform: "uppercase" }}>Principle</span>
          </div>
          <h3 style={{ fontFamily: serif, fontWeight: 400, fontSize: h3FontSize(bp, 26), lineHeight: 1.15, letterSpacing: -0.5, margin: "0 0 16px" }}>{c.h}</h3>
          <p style={{ fontSize: 14.5, lineHeight: 1.65, color: dim, margin: 0 }}>{c.p}</p>
        </div>
      ))}
    </div>
  </section>
);

const SpecialtiesD1 = ({ P, fg, dim, faint, accent, serif, mono, bp }: any) => {
  const [hover, setHover] = React.useState(null);
  return (
    <section style={{ padding: sectionPadding(bp, "120px 56px 140px"), borderTop: `0.5px solid ${faint}`, position: "relative", zIndex: 3 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 64 }}>
        <div>
          <div style={{ fontFamily: mono, fontSize: 11, color: accent, letterSpacing: 1.4, textTransform: "uppercase", marginBottom: 18 }}>
            § Areas of clinical focus
          </div>
          <h2 style={{ fontFamily: serif, fontWeight: 300, fontSize: h2FontSize(bp, "clamp(44px, 5vw, 76px)"), lineHeight: 1, letterSpacing: -1.4, margin: 0 }}>
            Four practices,<br /><em style={{ fontStyle: "italic", color: accent }}>one method.</em>
          </h2>
        </div>
        <div style={{ fontFamily: mono, fontSize: 11, color: dim, letterSpacing: 1, textTransform: "uppercase", textAlign: "right" }}>
          <div>04 / 04</div>
          <div style={{ color: faint, marginTop: 4 }}>Specialties</div>
        </div>
      </div>

      <div>
        {P.specialties.map((s, i) => (
          <div key={s.n}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            style={{
              display: "grid", gridTemplateColumns: collapseGridColumns(bp, "70px 1fr 2.4fr 1fr"),
              gap: collapseGridGap(bp, 32), padding: "32px 0",
              borderTop: `0.5px solid ${faint}`,
              borderBottom: i === P.specialties.length - 1 ? `0.5px solid ${faint}` : "none",
              alignItems: "start", cursor: "pointer",
              transition: "background 0.3s",
              background: hover === i ? `${accent}08` : "transparent",
              position: "relative",
            }}>
            <div style={{ fontFamily: mono, fontSize: 12, color: hover === i ? accent : dim, letterSpacing: 1, transition: "color 0.3s" }}>{s.n}</div>
            <h3 style={{
              fontFamily: serif, fontWeight: 400,
              fontSize: h3FontSize(bp, 30), lineHeight: 1.05, letterSpacing: -0.5, margin: 0,
              color: hover === i ? accent : fg, transition: "color 0.3s",
            }}>{s.title}</h3>
            <p style={{ fontSize: 15, lineHeight: 1.6, color: dim, margin: 0, maxWidth: 560 }}>{s.body}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "flex-end" }}>
              {s.tags.map((t) => (
                <span key={t} style={{
                  fontFamily: mono, fontSize: 10.5, color: dim, letterSpacing: 0.6,
                  padding: "4px 10px", border: `0.5px solid ${faint}`, borderRadius: 999,
                }}>{t}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

const ProcessD1 = ({ P, fg, dim, faint, veryFaint, accent, serif, mono, bp }: any) => (
  <section style={{ padding: sectionPadding(bp, "140px 56px"), borderTop: `0.5px solid ${faint}`, background: veryFaint, position: "relative", zIndex: 3 }}>
    <div style={{ display: "grid", gridTemplateColumns: collapseGridColumns(bp, "1fr 2fr"), gap: collapseGridGap(bp, 80), marginBottom: 80, alignItems: "start" }}>
      <div>
        <div style={{ fontFamily: mono, fontSize: 11, color: accent, letterSpacing: 1.4, textTransform: "uppercase", marginBottom: 18 }}>
          § What to expect
        </div>
        <div style={{ fontFamily: mono, fontSize: 11, color: dim, letterSpacing: 1, textTransform: "uppercase" }}>
          Four phases<br />of care.
        </div>
      </div>
      <h2 style={{
        fontFamily: serif, fontWeight: 300,
        fontSize: h2FontSize(bp, "clamp(40px, 4.4vw, 64px)"), lineHeight: 1.05, letterSpacing: -1, margin: 0, textWrap: "balance",
      }}>
        Care moves through <em style={{ fontStyle: "italic", color: accent }}>structured phases</em>—each with explicit hypotheses, decision points, and a written plan.
      </h2>
    </div>

    <div style={{ display: "grid", gridTemplateColumns: collapseGridColumns(bp, "repeat(4, 1fr)"), gap: collapseGridGap(bp, 32) }}>
      {P.process.map((p, i) => (
        <div key={p.n} style={{ position: "relative" }}>
          <div style={{
            fontFamily: serif, fontSize: 92, fontWeight: 300, color: accent, opacity: 0.5,
            lineHeight: 1, letterSpacing: -2, marginBottom: 12, fontStyle: "italic",
          }}>{p.n}</div>
          <div style={{ height: 1, background: faint, marginBottom: 18 }} />
          <div style={{ fontFamily: mono, fontSize: 10.5, color: dim, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>
            Phase {i + 1} · {p.duration}
          </div>
          <h3 style={{ fontFamily: serif, fontWeight: 400, fontSize: h3FontSize(bp, 24), lineHeight: 1.15, margin: "0 0 14px", letterSpacing: -0.4 }}>{p.title}</h3>
          <p style={{ fontSize: 14, lineHeight: 1.65, color: dim, margin: 0 }}>{p.body}</p>
        </div>
      ))}
    </div>
  </section>
);

const AboutD1 = ({ P, fg, dim, faint, accent, serif, mono, bp }: any) => (
  <section style={{ padding: sectionPadding(bp, "140px 56px"), borderTop: `0.5px solid ${faint}`, position: "relative", zIndex: 3 }}>
    <div style={{ display: "grid", gridTemplateColumns: collapseGridColumns(bp, "1fr 1.6fr"), gap: collapseGridGap(bp, 96), alignItems: "start" }}>
      <div>
        <div style={{ fontFamily: mono, fontSize: 11, color: accent, letterSpacing: 1.4, textTransform: "uppercase", marginBottom: 28 }}>
          § About
        </div>
        <div style={{
          aspectRatio: "3/4", border: `0.5px solid ${faint}`, position: "relative",
          marginBottom: 24, overflow: "hidden",
          background: `#1a1815 url(${P.portrait}) center/cover no-repeat`,
          filter: "saturate(0.85) contrast(1.05)",
        }}>
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, transparent 60%, rgba(14,15,18,0.5))`, pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: 12, left: 12, fontFamily: mono, fontSize: 10, color: "#fff", letterSpacing: 1, textTransform: "uppercase", mixBlendMode: "difference" }}>
            Plate I
          </div>
        </div>
        <div style={{ fontFamily: mono, fontSize: 10.5, color: dim, letterSpacing: 1, textTransform: "uppercase" }}>
          Fig. I—S. Tadlock, M.D.
        </div>
      </div>

      <div>
        <h2 style={{
          fontFamily: serif, fontWeight: 300,
          fontSize: h2FontSize(bp, "clamp(36px, 4vw, 60px)"), lineHeight: 1.05, letterSpacing: -1, margin: "0 0 40px", textWrap: "balance",
        }}>
          A psychiatrist trained at <em style={{ fontStyle: "italic", color: accent }}>Duke, UNC, and UCSF</em>—practicing at the intersection of medicine and performance.
        </h2>
        {P.bio.map((b, i) => (
          <p key={i} style={{ fontSize: 16, lineHeight: 1.7, color: dim, margin: "0 0 24px" }}>{b}</p>
        ))}

        <div style={{ marginTop: 64, borderTop: `0.5px solid ${faint}`, paddingTop: 32 }}>
          <div style={{ fontFamily: mono, fontSize: 10.5, color: dim, letterSpacing: 1, textTransform: "uppercase", marginBottom: 24 }}>
            Training
          </div>
          {P.credentials.map((c, i) => (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: collapseGridColumns(bp, "180px 1fr 200px"),
              gap: collapseGridGap(bp, 24), padding: "18px 0",
              borderTop: i > 0 ? `0.5px solid ${faint}` : "none",
              alignItems: "baseline",
            }}>
              <div style={{ fontFamily: mono, fontSize: 11.5, color: accent, letterSpacing: 1, textTransform: "uppercase" }}>{c.era}</div>
              <div style={{ fontFamily: serif, fontSize: 22, fontWeight: 400, letterSpacing: -0.3 }}>{c.school}</div>
              <div style={{ fontSize: 13, color: dim, textAlign: "right", fontStyle: "italic", fontFamily: serif }}>{c.years}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

const WaitlistD1 = ({ P, fg, dim, faint, bg, accent, serif, mono, bp }: any) => {
  const [email, setEmail] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);
  return (
    <section style={{ padding: sectionPadding(bp, "160px 56px"), borderTop: `0.5px solid ${faint}`, position: "relative", zIndex: 3 }}>
      <div style={{ maxWidth: 980, margin: "0 auto", textAlign: "center" }}>
        <div style={{ fontFamily: mono, fontSize: 11, color: accent, letterSpacing: 1.4, textTransform: "uppercase", marginBottom: 32 }}>
          § Now accepting new patients · By application
        </div>
        <h2 style={{
          fontFamily: serif, fontWeight: 300,
          fontSize: h2FontSize(bp, "clamp(48px, 6vw, 96px)"), lineHeight: 0.98, letterSpacing: -1.8, margin: 0, textWrap: "balance",
        }}>
          The work begins with a <em style={{ fontStyle: "italic", color: accent }}>conversation.</em>
        </h2>
        <p style={{ marginTop: 32, fontSize: 17, lineHeight: 1.55, color: dim, maxWidth: 640, marginInline: "auto" }}>
          A short application opens a 20-minute fit call. If we agree the practice is the right place for you, we proceed to the initial consultation.
        </p>

        {!submitted ? (
          <form onSubmit={(e: any) => { e.preventDefault(); if (email) setSubmitted(true); }}
            style={{ marginTop: 56, display: "flex", maxWidth: 540, marginInline: "auto", border: `1px solid ${faint}`, borderRadius: 0 }}>
            <input type="email" placeholder="you@domain.com" required
              value={email} onChange={(e: any) => setEmail(e.target.value)}
              style={{
                flex: 1, padding: "18px 22px", border: "none", background: "transparent",
                color: fg, fontSize: 15, fontFamily: mono, outline: "none",
              }} />
            <button type="submit" style={{
              padding: "0 28px", border: "none", borderLeft: `1px solid ${faint}`,
              background: accent, color: "#0E0F12",
              fontFamily: mono, fontSize: 12, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer", fontWeight: 600,
            }}>Apply →</button>
          </form>
        ) : (
          <div style={{
            marginTop: 56, padding: "24px 32px", border: `1px solid ${accent}`,
            display: "inline-block", fontFamily: mono, fontSize: 12.5, color: accent, letterSpacing: 1, textTransform: "uppercase",
          }}>
            ✓ Application received—we'll be in touch within two business days.
          </div>
        )}

        <div style={{ marginTop: 40, fontFamily: mono, fontSize: 10.5, color: dim, letterSpacing: 1, textTransform: "uppercase" }}>
          {P.location} · {P.format} · Out-of-network
        </div>
      </div>
    </section>
  );
};

const FooterD1 = ({ P, fg, dim, faint, accent, serif, mono, bp }: any) => (
  <footer style={{ padding: sectionPadding(bp, "56px 56px 36px"), borderTop: `0.5px solid ${faint}`, position: "relative", zIndex: 3 }}>
    <div style={{ display: "grid", gridTemplateColumns: collapseGridColumns(bp, "2fr 1fr 1fr 1fr"), gap: collapseGridGap(bp, 40), marginBottom: 64, alignItems: "start" }}>
      <div>
        <div style={{ fontFamily: serif, fontSize: 28, fontWeight: 300, letterSpacing: -0.5 }}>
          Sterling Tadlock, M.D.
        </div>
        <div style={{ fontFamily: mono, fontSize: 11, color: dim, letterSpacing: 1, textTransform: "uppercase", marginTop: 8 }}>
          {P.practice}
        </div>
      </div>
      <FooterCol bp={bp} mono={mono} dim={dim} faint={faint} fg={fg} title="Office" items={[P.contact.address, P.contact.hours]} />
      <FooterCol bp={bp} mono={mono} dim={dim} faint={faint} fg={fg} title="Contact" items={[P.contact.email, "+1 415 · by request"]} />
      <FooterCol bp={bp} mono={mono} dim={dim} faint={faint} fg={fg} title="Notice" items={["No emergencies", "If in crisis, call 988"]} />
    </div>
    <div style={{
      borderTop: `0.5px solid ${faint}`, paddingTop: 24,
      display: "flex", justifyContent: "space-between", alignItems: "center",
      fontFamily: mono, fontSize: 10.5, color: dim, letterSpacing: 1, textTransform: "uppercase",
    }}>
      <div>© 2026—Tadlock Psychiatry, LLC</div>
      <div>CA Lic · Pending</div>
      <div>Site v0.1 · {P.established}</div>
    </div>
  </footer>
);

const FooterCol = ({ mono, dim, faint, fg, title, items, bp }: any) => (
  <div>
    <div style={{ fontFamily: mono, fontSize: 10, color: dim, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>{title}</div>
    {items.map((it, i) => (
      <div key={i} style={{ fontSize: 13, color: fg, marginBottom: 4 }}>{it}</div>
    ))}
  </div>
);

const mount: DirectionMount = (rootEl, props) => {
  createRoot(rootEl).render(createElement(D1, props));
};

export default mount;
