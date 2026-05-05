// Direction 2—Quiet Clinical
// Off-white, near-black, single muted accent. Mono + sans pairing,
// data-confident layout, parallax depth on scroll, hover-driven micro-
// interactions.
//
// Phase 5 (#25) — see direction-1.tsx header for the theme/useViewport
// rationale. Phase 4 (#24) DirectionMount contract unchanged.
import React, { createElement } from "react";
import { createRoot } from "react-dom/client";
import type { DirectionComponent, DirectionMount } from "../src/types";
import { getD2Theme } from "./d2/theme";
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

const D2: DirectionComponent = ({ tweaks, practice: P }) => {
  const t = getD2Theme(tweaks);
  const { bg, fg, dim, faint, card, accent, sans, mono, dark, heroVariant } = t;
  const { bp } = useViewport();

  const rootRef = React.useRef<any>(null);
  const [scrollY, setScrollY] = React.useState(0);
  const [mouse, setMouse] = React.useState({ x: 0.5, y: 0.5 });

  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const onScroll = () => setScrollY(root.scrollTop);
    const onMove = (e: any) => {
      const r = root.getBoundingClientRect();
      setMouse({ x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height });
    };
    root.addEventListener("scroll", onScroll);
    root.addEventListener("mousemove", onMove);
    return () => {
      root.removeEventListener("scroll", onScroll);
      root.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <div ref={rootRef} className="d-root" style={{
      width: "100%", height: "100%", overflow: "auto",
      background: bg, color: fg, fontFamily: sans,
      scrollbarWidth: "thin", scrollbarColor: `${faint} transparent`,
    }}>
      <NavBarD2 bp={bp} fg={fg} dim={dim} faint={faint} accent={accent} mono={mono} bg={bg} />
      <HeroD2 bp={bp} P={P} fg={fg} dim={dim} faint={faint} accent={accent} mono={mono} card={card} bg={bg}
        scrollY={scrollY} mouse={mouse} variant={heroVariant} dark={dark} />
      <PrincipleD2 bp={bp} P={P} fg={fg} dim={dim} faint={faint} accent={accent} mono={mono} card={card} />
      <SpecialtiesD2 bp={bp} P={P} fg={fg} dim={dim} faint={faint} accent={accent} mono={mono} card={card} />
      <ProcessD2 bp={bp} P={P} fg={fg} dim={dim} faint={faint} accent={accent} mono={mono} card={card} />
      <AboutD2 bp={bp} P={P} fg={fg} dim={dim} faint={faint} accent={accent} mono={mono} card={card} />
      <WaitlistD2 bp={bp} P={P} fg={fg} dim={dim} faint={faint} accent={accent} mono={mono} card={card} />
      <FooterD2 bp={bp} P={P} fg={fg} dim={dim} faint={faint} accent={accent} mono={mono} />
    </div>
  );
};

const NavBarD2 = ({ fg, dim, faint, accent, mono, bg, bp }: any) => {
  const [open, setOpen] = React.useState(false);
  const isMobile = bp === "mobile" || bp === "tablet";
  const links = ["Practice", "Specialties", "Process", "About"];
  return (
  <nav style={{
    position: "sticky", top: 0, zIndex: 10,
    padding: bp === "mobile" ? "12px 16px" : "16px 48px",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    backdropFilter: "blur(24px) saturate(140%)", WebkitBackdropFilter: "blur(24px) saturate(140%)",
    borderBottom: `0.5px solid ${faint}`,
    background: `${bg}cc`,
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ width: 22, height: 22, background: accent, borderRadius: 2 }} />
      <div style={{ fontSize: 14.5, fontWeight: 600, letterSpacing: -0.2 }}>Tadlock Psychiatry</div>
      {!isMobile && (
        <div style={{ fontFamily: mono, fontSize: 10.5, color: dim, letterSpacing: 0.8, textTransform: "uppercase", paddingLeft: 14, marginLeft: 4, borderLeft: `1px solid ${faint}` }}>
          SF · Jackson Sq.
        </div>
      )}
    </div>
    {isMobile ? (
      <button
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        style={{
          width: 44, height: 44, padding: 0,
          display: "grid", placeItems: "center",
          background: "transparent", border: `1px solid ${faint}`,
          color: fg, cursor: "pointer", borderRadius: 4,
        }}
      >
        {open ? (
          <span style={{ fontSize: 18, lineHeight: 1 }}>×</span>
        ) : (
          <span style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ width: 18, height: 1.5, background: fg }} />
            <span style={{ width: 18, height: 1.5, background: fg }} />
            <span style={{ width: 18, height: 1.5, background: fg }} />
          </span>
        )}
      </button>
    ) : (
      <>
        <div style={{ display: "flex", gap: 32, fontSize: 13.5 }}>
          {links.map((l, i) => (
            <a key={l} style={{ color: i === 0 ? fg : dim, textDecoration: "none", cursor: "pointer", fontWeight: i === 0 ? 500 : undefined }}>{l}</a>
          ))}
        </div>
        <button style={{
          padding: "9px 18px", borderRadius: 999, border: "none", background: accent, color: "#fff",
          fontSize: 13, fontWeight: 500, cursor: "pointer", letterSpacing: -0.1,
        }}>Request consult →</button>
      </>
    )}
    {isMobile && open && (
      <div style={{
        position: "absolute", top: "100%", left: 0, right: 0,
        background: bg,
        backdropFilter: "blur(24px) saturate(140%)",
        WebkitBackdropFilter: "blur(24px) saturate(140%)",
        borderBottom: `0.5px solid ${faint}`,
        padding: "16px 16px 24px",
        display: "flex", flexDirection: "column",
      }}>
        {links.map((l) => (
          <a
            key={l}
            onClick={() => setOpen(false)}
            style={{
              display: "block",
              padding: "16px 0",
              color: fg, textDecoration: "none", cursor: "pointer",
              fontSize: 14, fontWeight: 500,
              borderBottom: `0.5px solid ${faint}`,
              minHeight: 44,
            }}
          >{l}</a>
        ))}
        <a
          onClick={() => setOpen(false)}
          style={{
            marginTop: 16, padding: "12px 18px",
            borderRadius: 999, border: "none", background: accent, color: "#fff",
            fontSize: 13, fontWeight: 500, cursor: "pointer", letterSpacing: -0.1,
            textAlign: "center", textDecoration: "none",
            minHeight: 44,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >Request consult →</a>
      </div>
    )}
  </nav>
  );
};

const HeroD2 = ({ P, fg, dim, faint, accent, mono, card, bg, scrollY, mouse, variant, dark, bp }: any) => {
  if (variant === "stack") return <HeroD2Stack bp={bp} P={P} fg={fg} dim={dim} faint={faint} accent={accent} mono={mono} card={card} scrollY={scrollY} mouse={mouse} />;
  if (variant === "wide") return <HeroD2Wide bp={bp} P={P} fg={fg} dim={dim} faint={faint} accent={accent} mono={mono} card={card} scrollY={scrollY} />;
  return <HeroD2Metrics bp={bp} P={P} fg={fg} dim={dim} faint={faint} accent={accent} mono={mono} card={card} bg={bg} scrollY={scrollY} mouse={mouse} dark={dark} />;
};

const HeroD2Metrics = ({ P, fg, dim, faint, accent, mono, card, bg, scrollY, mouse, dark, bp }: any) => {
  // ambient wireframe sphere parallax
  const ax = (mouse.x - 0.5) * 24;
  const ay = (mouse.y - 0.5) * 24;
  return (
    <section style={{ position: "relative", padding: sectionPadding(bp, "96px 48px 80px"), overflow: "hidden", minHeight: "94vh" }}>
      {/* Layered parallax background—ambient depth */}
      <div style={{
        position: "absolute", top: 80 + scrollY * -0.2 + ay, right: -160 + ax,
        width: 720, height: 720, pointerEvents: "none", opacity: dark ? 0.18 : 0.12, zIndex: 0,
        transition: "transform 0.6s cubic-bezier(0.2,0.7,0.3,1)",
      }}>
        <svg viewBox="0 0 720 720" style={{ width: "100%", height: "100%" }}>
          <defs>
            <radialGradient id="d2gr" cx="50%" cy="50%">
              <stop offset="0%" stopColor={accent} stopOpacity="0.6" />
              <stop offset="100%" stopColor={accent} stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="360" cy="360" r="340" fill="url(#d2gr)" />
          {[...Array(14)].map((_, i) => (
            <ellipse key={i} cx="360" cy="360" rx={340 - i * 6} ry={(340 - i * 6) * Math.cos(i * 0.22)}
              fill="none" stroke={accent} strokeWidth="0.5" opacity={0.5} />
          ))}
          {[...Array(14)].map((_, i) => (
            <ellipse key={"b" + i} cx="360" cy="360" rx={(340 - i * 6) * Math.cos(i * 0.22)} ry={340 - i * 6}
              fill="none" stroke={accent} strokeWidth="0.5" opacity={0.4} />
          ))}
        </svg>
      </div>

      <div style={{ position: "relative", zIndex: 2 }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 10, padding: "6px 12px",
          borderRadius: 999, border: `1px solid ${faint}`, background: card,
          fontFamily: mono, fontSize: 11, letterSpacing: 0.6,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: 3, background: "#7CA982", boxShadow: "0 0 10px #7CA982" }} />
          <span style={{ color: fg }}>Now accepting new patients</span>
          <span style={{ color: dim }}>·</span>
          <span style={{ color: dim }}>{P.location}</span>
        </div>

        <h1 style={{
          marginTop: 40, fontWeight: 500,
          fontSize: h1FontSize(bp, "clamp(54px, 7vw, 116px)"), lineHeight: h1LineHeight(bp, 0.96), letterSpacing: -3.2,
          margin: "40px 0 0", maxWidth: 1200, textWrap: "balance",
        }}>
          Psychiatry for people whose work depends on a clear mind.
        </h1>

        <div style={{ marginTop: 48, display: "grid", gridTemplateColumns: collapseGridColumns(bp, "1.4fr 1fr"), gap: collapseGridGap(bp, 80), alignItems: "start" }}>
          <p style={{ fontSize: 19, lineHeight: 1.55, color: dim, margin: 0, maxWidth: 640 }}>
            {P.heroSub}
          </p>
          <div style={{
            padding: "24px 28px", background: card, border: `1px solid ${faint}`, borderRadius: 4,
          }}>
            <div style={{ fontFamily: mono, fontSize: 10, color: dim, letterSpacing: 1, textTransform: "uppercase", marginBottom: 14 }}>
              Practice profile
            </div>
            <div style={{ display: "grid", gap: 12 }}>
              {P.metrics.map((m) => (
                <div key={m.l} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16 }}>
                  <span style={{ fontSize: 13, color: dim }}>{m.l}</span>
                  <span style={{ fontFamily: mono, fontSize: 14, color: fg, fontWeight: 600 }}>
                    {m.v}<span style={{ color: dim, fontWeight: 400 }}>{m.u}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 56, display: "flex", alignItems: "center", gap: 14 }}>
          <button style={{
            padding: "16px 26px", border: "none", background: accent, color: "#fff",
            fontSize: 14.5, fontWeight: 500, cursor: "pointer", borderRadius: 4, letterSpacing: -0.1,
          }}>Request a consultation</button>
          <button style={{
            padding: "16px 22px", border: `1px solid ${faint}`, background: "transparent", color: fg,
            fontSize: 14.5, fontWeight: 500, cursor: "pointer", borderRadius: 4, letterSpacing: -0.1,
          }}>Read the practice brief</button>
        </div>
      </div>
    </section>
  );
};

const HeroD2Stack = ({ P, fg, dim, faint, accent, mono, card, bp }: any) => (
  <section style={{ padding: sectionPadding(bp, "120px 48px 100px"), minHeight: "88vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
    <div style={{ fontFamily: mono, fontSize: 11, color: accent, letterSpacing: 1.4, textTransform: "uppercase", marginBottom: 40 }}>
      {P.heroEyebrow} · {P.established}
    </div>
    <h1 style={{
      fontWeight: 500, fontSize: h1FontSize(bp, "clamp(48px, 6vw, 100px)"), lineHeight: h1LineHeight(bp, 0.96),
      letterSpacing: -2.4, margin: 0, maxWidth: 1320, textWrap: "balance",
    }}>
      A psychiatry practice for the moments your performance depends on.
    </h1>
    <p style={{ marginTop: 36, fontSize: 18, lineHeight: 1.6, color: dim, maxWidth: 720, margin: "36px 0 0" }}>{P.heroSub}</p>
    <div style={{ marginTop: 56, display: "flex", gap: 12 }}>
      <button style={{ padding: "14px 24px", border: "none", background: accent, color: "#fff", borderRadius: 4, fontSize: 14, fontWeight: 500, cursor: "pointer" }}>Request a consult</button>
      <button style={{ padding: "14px 22px", border: `1px solid ${faint}`, background: card, color: fg, borderRadius: 4, fontSize: 14, fontWeight: 500, cursor: "pointer" }}>Practice brief</button>
    </div>
  </section>
);

const HeroD2Wide = ({ P, fg, dim, faint, accent, mono, card, scrollY, bp }: any) => (
  <section style={{ padding: sectionPadding(bp, "100px 48px"), minHeight: "90vh", display: "grid", gridTemplateColumns: collapseGridColumns(bp, "1.5fr 1fr"), gap: collapseGridGap(bp, 64), alignItems: "center" }}>
    <div>
      <div style={{ fontFamily: mono, fontSize: 11, color: accent, letterSpacing: 1.4, textTransform: "uppercase", marginBottom: 36 }}>
        {P.heroEyebrow}
      </div>
      <h1 style={{ fontWeight: 500, fontSize: h1FontSize(bp, "clamp(44px, 5.4vw, 88px)"), lineHeight: h1LineHeight(bp, 1), letterSpacing: -2.2, margin: 0, textWrap: "balance" }}>
        Clinical psychiatry, applied to the architecture of high performance.
      </h1>
      <p style={{ marginTop: 32, fontSize: 17, lineHeight: 1.6, color: dim, maxWidth: 580 }}>{P.heroSub}</p>
      <div style={{ marginTop: 40, display: "flex", gap: 12 }}>
        <button style={{ padding: "14px 22px", border: "none", background: accent, color: "#fff", borderRadius: 4, fontSize: 14, fontWeight: 500, cursor: "pointer" }}>Request a consult</button>
      </div>
    </div>
    <div style={{
      transform: `translateY(${scrollY * 0.06}px)`,
      padding: 28, background: card, border: `1px solid ${faint}`, borderRadius: 6,
    }}>
      <div style={{ fontFamily: mono, fontSize: 10, color: dim, letterSpacing: 1, textTransform: "uppercase", marginBottom: 18 }}>Practice profile</div>
      {P.metrics.map((m, i) => (
        <div key={m.l} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "12px 0", borderTop: i > 0 ? `0.5px solid ${faint}` : "none" }}>
          <span style={{ fontSize: 13.5, color: dim }}>{m.l}</span>
          <span style={{ fontFamily: mono, fontSize: 15, fontWeight: 600 }}>{m.v}<span style={{ color: dim, fontWeight: 400 }}>{m.u}</span></span>
        </div>
      ))}
    </div>
  </section>
);

const PrincipleD2 = ({ P, fg, dim, faint, accent, mono, card, bp }: any) => (
  <section style={{ padding: sectionPadding(bp, "120px 48px"), borderTop: `0.5px solid ${faint}` }}>
    <div style={{ display: "grid", gridTemplateColumns: collapseGridColumns(bp, "1fr 2fr"), gap: collapseGridGap(bp, 80), alignItems: "start" }}>
      <div>
        <div style={{ fontFamily: mono, fontSize: 11, color: accent, letterSpacing: 1.4, textTransform: "uppercase", marginBottom: 16 }}>
          ◇ The premise
        </div>
        <h2 style={{ fontWeight: 500, fontSize: h2FontSize(bp, "clamp(34px, 3.8vw, 56px)"), lineHeight: 1.05, letterSpacing: -1.4, margin: 0, textWrap: "balance" }}>
          Most psychiatry treats absence of distress as the goal. We treat it as the floor.
        </h2>
      </div>
      <div style={{ display: "grid", gap: 20 }}>
        {P.positioning.map((c) => (
          <PrincipleCardD2 bp={bp} key={c.k} c={c} fg={fg} dim={dim} faint={faint} accent={accent} mono={mono} card={card} />
        ))}
      </div>
    </div>
  </section>
);

const PrincipleCardD2 = ({ c, fg, dim, faint, accent, mono, card, bp }: any) => {
  const [hover, setHover] = React.useState(false);
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        padding: "28px 32px", background: card, border: `1px solid ${hover ? accent : faint}`,
        borderRadius: 6, display: "grid", gridTemplateColumns: collapseGridColumns(bp, "60px 1fr"),
        gap: collapseGridGap(bp, 24), alignItems: "start", transition: "border-color 0.2s, transform 0.2s",
        transform: hover ? "translateX(4px)" : "translateX(0)",
      }}>
      <div style={{
        fontFamily: mono, fontSize: 13, color: hover ? accent : dim,
        letterSpacing: 1, paddingTop: 4, transition: "color 0.2s",
      }}>{c.k}</div>
      <div>
        <h3 style={{ fontSize: h3FontSize(bp, 20), fontWeight: 600, letterSpacing: -0.4, margin: "0 0 10px" }}>{c.h}</h3>
        <p style={{ fontSize: 14.5, lineHeight: 1.65, color: dim, margin: 0 }}>{c.p}</p>
      </div>
    </div>
  );
};

const SpecialtiesD2 = ({ P, fg, dim, faint, accent, mono, card, bp }: any) => (
  <section style={{ padding: sectionPadding(bp, "120px 48px"), borderTop: `0.5px solid ${faint}` }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 48 }}>
      <div>
        <div style={{ fontFamily: mono, fontSize: 11, color: accent, letterSpacing: 1.4, textTransform: "uppercase", marginBottom: 18 }}>
          ◇ Areas of clinical focus
        </div>
        <h2 style={{ fontWeight: 500, fontSize: h2FontSize(bp, "clamp(36px, 4.2vw, 64px)"), lineHeight: 1.02, letterSpacing: -1.6, margin: 0 }}>
          Four practices, one method.
        </h2>
      </div>
      <div style={{ fontFamily: mono, fontSize: 11, color: dim, letterSpacing: 1, textTransform: "uppercase" }}>04 / 04 Specialties</div>
    </div>

    <div style={{ display: "grid", gridTemplateColumns: collapseGridColumns(bp, "repeat(2, 1fr)"), gap: collapseGridGap(bp, 16) }}>
      {P.specialties.map((s) => (
        <SpecCardD2 bp={bp} key={s.n} s={s} fg={fg} dim={dim} faint={faint} accent={accent} mono={mono} card={card} />
      ))}
    </div>
  </section>
);

const SpecCardD2 = ({ s, fg, dim, faint, accent, mono, card, bp }: any) => {
  const [hover, setHover] = React.useState(false);
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        padding: "32px 36px", background: card, border: `1px solid ${faint}`, borderRadius: 8,
        position: "relative", overflow: "hidden", transition: "transform 0.3s, box-shadow 0.3s",
        transform: hover ? "translateY(-2px)" : "translateY(0)",
        boxShadow: hover ? "0 12px 36px rgba(0,0,0,0.08)" : "none",
      }}>
      {/* hover-revealed accent rule */}
      <div style={{
        position: "absolute", top: 0, left: 0, height: 2, background: accent,
        width: hover ? "100%" : "0%", transition: "width 0.4s cubic-bezier(0.2,0.7,0.3,1)",
      }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 18 }}>
        <span style={{ fontFamily: mono, fontSize: 12, color: accent, letterSpacing: 1 }}>{s.n}</span>
        <span style={{ fontFamily: mono, fontSize: 10, color: dim, letterSpacing: 1, textTransform: "uppercase" }}>Focus area</span>
      </div>
      <h3 style={{ fontSize: h3FontSize(bp, 26), fontWeight: 600, letterSpacing: -0.6, margin: "0 0 14px", lineHeight: 1.1 }}>{s.title}</h3>
      <p style={{ fontSize: 14.5, lineHeight: 1.65, color: dim, margin: "0 0 20px" }}>{s.body}</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {s.tags.map((t) => (
          <span key={t} style={{
            fontFamily: mono, fontSize: 10.5, color: dim, padding: "3px 9px",
            border: `0.5px solid ${faint}`, borderRadius: 999, letterSpacing: 0.4,
          }}>{t}</span>
        ))}
      </div>
    </div>
  );
};

const ProcessD2 = ({ P, fg, dim, faint, accent, mono, card, bp }: any) => (
  <section style={{ padding: sectionPadding(bp, "120px 48px"), borderTop: `0.5px solid ${faint}` }}>
    <div style={{ marginBottom: 56, display: "grid", gridTemplateColumns: collapseGridColumns(bp, "1fr 1.6fr"), gap: collapseGridGap(bp, 64) }}>
      <div style={{ fontFamily: mono, fontSize: 11, color: accent, letterSpacing: 1.4, textTransform: "uppercase" }}>
        ◇ What to expect<br /><span style={{ color: dim, marginTop: 6, display: "block" }}>Four phases of care</span>
      </div>
      <h2 style={{ fontWeight: 500, fontSize: h2FontSize(bp, "clamp(34px, 3.8vw, 56px)"), lineHeight: 1.05, letterSpacing: -1.4, margin: 0, textWrap: "balance" }}>
        Care moves through structured phases—each with explicit hypotheses, decision points, and a written plan.
      </h2>
    </div>

    <div style={{
      display: "grid", gridTemplateColumns: collapseGridColumns(bp, "repeat(4, 1fr)"), gap: 0,
      border: `1px solid ${faint}`, borderRadius: 8, overflow: "hidden",
      background: card,
    }}>
      {P.process.map((p, i) => (
        <div key={p.n} style={{
          padding: "32px 28px",
          borderRight: i < 3 ? `1px solid ${faint}` : "none",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <span style={{ fontFamily: mono, fontSize: 11, color: accent, letterSpacing: 1 }}>Phase {i + 1}</span>
            <span style={{
              fontFamily: mono, fontSize: 10, color: dim, letterSpacing: 0.5,
              padding: "3px 8px", border: `0.5px solid ${faint}`, borderRadius: 999,
            }}>{p.duration}</span>
          </div>
          <div style={{ fontFamily: mono, fontSize: 36, fontWeight: 600, color: fg, letterSpacing: -1, marginBottom: 18 }}>{p.n}</div>
          <h3 style={{ fontSize: h3FontSize(bp, 18), fontWeight: 600, letterSpacing: -0.3, margin: "0 0 12px" }}>{p.title}</h3>
          <p style={{ fontSize: 13.5, lineHeight: 1.6, color: dim, margin: 0 }}>{p.body}</p>
        </div>
      ))}
    </div>
  </section>
);

const AboutD2 = ({ P, fg, dim, faint, accent, mono, card, bp }: any) => (
  <section style={{ padding: sectionPadding(bp, "120px 48px"), borderTop: `0.5px solid ${faint}` }}>
    <div style={{ display: "grid", gridTemplateColumns: collapseGridColumns(bp, "1fr 1.4fr"), gap: collapseGridGap(bp, 80), alignItems: "start" }}>
      <div>
        <div style={{
          aspectRatio: "4/5", border: `1px solid ${faint}`, borderRadius: 6,
          position: "relative", overflow: "hidden",
          background: `#14171c url(${P.portrait}) center/cover no-repeat`,
        }}>
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, transparent 65%, rgba(20,23,28,0.45))`, pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: 14, left: 14, fontFamily: mono, fontSize: 10, color: "#fff", letterSpacing: 1, textTransform: "uppercase" }}>
            S. Tadlock, M.D.
          </div>
        </div>
      </div>
      <div>
        <div style={{ fontFamily: mono, fontSize: 11, color: accent, letterSpacing: 1.4, textTransform: "uppercase", marginBottom: 24 }}>
          ◇ About the practice
        </div>
        <h2 style={{ fontWeight: 500, fontSize: h2FontSize(bp, "clamp(32px, 3.6vw, 52px)"), lineHeight: 1.05, letterSpacing: -1.2, margin: "0 0 32px", textWrap: "balance" }}>
          A psychiatrist trained at Duke, UNC, and UCSF—practicing where medicine and performance meet.
        </h2>
        {P.bio.map((b, i) => (
          <p key={i} style={{ fontSize: 16, lineHeight: 1.7, color: dim, margin: "0 0 22px" }}>{b}</p>
        ))}
        <div style={{
          marginTop: 40, padding: 28, background: card, border: `1px solid ${faint}`, borderRadius: 6,
        }}>
          <div style={{ fontFamily: mono, fontSize: 10, color: dim, letterSpacing: 1, textTransform: "uppercase", marginBottom: 18 }}>Training & credentials</div>
          {P.credentials.map((c, i) => (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: collapseGridColumns(bp, "150px 1fr"),
              gap: collapseGridGap(bp, 24), padding: "14px 0",
              borderTop: i > 0 ? `0.5px solid ${faint}` : "none", alignItems: "baseline",
            }}>
              <div style={{ fontFamily: mono, fontSize: 11.5, color: accent, letterSpacing: 0.6 }}>{c.era}</div>
              <div>
                <div style={{ fontSize: 15.5, fontWeight: 500, letterSpacing: -0.2 }}>{c.school}</div>
                <div style={{ fontSize: 12.5, color: dim, marginTop: 3 }}>{c.years}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

const WaitlistD2 = ({ P, fg, dim, faint, accent, mono, card, bp }: any) => {
  const [email, setEmail] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);
  return (
    <section style={{ padding: sectionPadding(bp, "120px 48px"), borderTop: `0.5px solid ${faint}` }}>
      <div style={{
        padding: 64, background: card, border: `1px solid ${faint}`, borderRadius: 12,
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: -120, right: -120, width: 360, height: 360,
          background: `radial-gradient(circle, ${accent}20, transparent 70%)`, pointerEvents: "none",
        }} />
        <div style={{ position: "relative", display: "grid", gridTemplateColumns: collapseGridColumns(bp, "1.3fr 1fr"), gap: collapseGridGap(bp, 80), alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: mono, fontSize: 11, color: accent, letterSpacing: 1.4, textTransform: "uppercase", marginBottom: 20 }}>
              ◇ Now accepting new patients
            </div>
            <h2 style={{ fontWeight: 500, fontSize: h2FontSize(bp, "clamp(36px, 4.4vw, 64px)"), lineHeight: 1, letterSpacing: -1.6, margin: "0 0 24px", textWrap: "balance" }}>
              The work begins with a conversation.
            </h2>
            <p style={{ fontSize: 16.5, lineHeight: 1.6, color: dim, margin: 0, maxWidth: 480 }}>
              A short application opens a 20-minute fit call. If we agree the practice is the right place for you, we proceed to the initial consultation.
            </p>
          </div>
          <div>
            {!submitted ? (
              <form onSubmit={(e: any) => { e.preventDefault(); if (email) setSubmitted(true); }}>
                <label style={{ fontFamily: mono, fontSize: 10.5, color: dim, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Email</label>
                <input type="email" required value={email} onChange={(e: any) => setEmail(e.target.value)} placeholder="you@domain.com"
                  style={{
                    width: "100%", padding: "14px 16px", border: `1px solid ${faint}`,
                    background: "transparent", color: fg, fontSize: 15, borderRadius: 4, outline: "none",
                    fontFamily: "inherit", marginBottom: 12, boxSizing: "border-box",
                  }} />
                <button type="submit" style={{
                  width: "100%", padding: "14px 22px", border: "none", background: accent, color: "#fff",
                  fontSize: 14.5, fontWeight: 500, cursor: "pointer", borderRadius: 4, letterSpacing: -0.1,
                }}>Begin application →</button>
                <div style={{ fontSize: 11.5, color: dim, marginTop: 12, lineHeight: 1.5 }}>
                  By submitting, you'll receive a brief intake form. Not for emergencies—if in crisis, call 988.
                </div>
              </form>
            ) : (
              <div style={{
                padding: 24, border: `1px solid ${accent}`, borderRadius: 6,
                fontFamily: mono, fontSize: 13, color: fg,
              }}>
                ✓ Application received. We'll be in touch within two business days.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

const FooterD2 = ({ P, fg, dim, faint, accent, mono, bp }: any) => (
  <footer style={{ padding: sectionPadding(bp, "56px 48px 32px"), borderTop: `0.5px solid ${faint}` }}>
    <div style={{ display: "grid", gridTemplateColumns: collapseGridColumns(bp, "2fr 1fr 1fr 1fr"), gap: collapseGridGap(bp, 40), marginBottom: 48, alignItems: "start" }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
          <div style={{ width: 22, height: 22, background: accent, borderRadius: 2 }} />
          <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: -0.2 }}>Tadlock Psychiatry</div>
        </div>
        <div style={{ fontSize: 13, color: dim, maxWidth: 360, lineHeight: 1.55 }}>{P.practice}. {P.location}. {P.format}.</div>
      </div>
      <FootCol bp={bp} mono={mono} dim={dim} title="Office" items={[P.contact.address, P.contact.hours]} />
      <FootCol bp={bp} mono={mono} dim={dim} title="Contact" items={[P.contact.email, "+1 415 · by request"]} />
      <FootCol bp={bp} mono={mono} dim={dim} title="Notice" items={["Out-of-network", "If in crisis, call 988"]} />
    </div>
    <div style={{
      borderTop: `0.5px solid ${faint}`, paddingTop: 18,
      display: "flex", justifyContent: "space-between",
      fontFamily: mono, fontSize: 10.5, color: dim, letterSpacing: 1, textTransform: "uppercase",
    }}>
      <div>© 2026—Tadlock Psychiatry, LLC</div>
      <div>Site v0.1 · {P.established}</div>
    </div>
  </footer>
);

const FootCol = ({ mono, dim, title, items, bp }: any) => (
  <div>
    <div style={{ fontFamily: mono, fontSize: 10, color: dim, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>{title}</div>
    {items.map((it, i) => <div key={i} style={{ fontSize: 13, marginBottom: 4 }}>{it}</div>)}
  </div>
);

const mount: DirectionMount = (rootEl, props) => {
  createRoot(rootEl).render(createElement(D2, props));
};

export default mount;
