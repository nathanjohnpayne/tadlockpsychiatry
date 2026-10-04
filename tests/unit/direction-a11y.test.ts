// Accessibility + honest-copy checks for the rendered direction
// prototypes (dist-protected/direction-{1,2,3}.js, built by the
// `pretest` hook). Each module is mounted into jsdom with the real
// content module, then the DOM is inspected:
//
//   - nav / CTA links are real links (href) whose #targets exist
//   - no clickable <div>s standing in for links or buttons
//   - every form control has an accessible label
//   - no inline `outline: none`, and a :focus-visible rule is present
//   - the waitlist/application form is clearly a non-submitting
//     prototype: it never claims an application was received, and
//     submitting it shows a "preview only—nothing was sent" status.
import { afterEach, describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const distRoot = resolve(__dirname, "../../dist-protected");
const buildExists = existsSync(resolve(distRoot, "content.js"));

const load = async (file: string) =>
  (await import(/* @vite-ignore */ pathToFileURL(resolve(distRoot, file)).href)).default;

const settle = () => new Promise((r) => setTimeout(r, 50));

afterEach(() => {
  document.body.innerHTML = "";
});

describe.skipIf(!buildExists)("direction prototypes (a11y + form copy)", () => {
  for (const id of ["1", "2", "3"]) {
    describe(`direction-${id}`, () => {
      const mount = async () => {
        const practice = await load("content.js");
        const mountFn = await load(`direction-${id}.js`);
        const root = document.createElement("div");
        document.body.appendChild(root);
        mountFn(root, { tweaks: { dark: true }, practice });
        await settle();
        return root;
      };

      it("renders links with hrefs that resolve to in-page sections", async () => {
        const root = await mount();
        const anchors = [...root.querySelectorAll("a")];
        expect(anchors.length).toBeGreaterThan(0);
        for (const a of anchors) {
          const href = a.getAttribute("href");
          expect(href, a.textContent ?? "").toBeTruthy();
          if (href!.startsWith("#")) {
            expect(root.querySelector(href!), href!).not.toBeNull();
          }
        }
      });

      it("has no clickable divs standing in for controls", async () => {
        const root = await mount();
        const fake = [...root.querySelectorAll("div")].filter((d) =>
          /request consult|apply/i.test(d.textContent ?? "") &&
          (d as HTMLElement).style.cursor === "pointer" &&
          d.children.length === 0,
        );
        expect(fake).toEqual([]);
      });

      it("labels every form control", async () => {
        const root = await mount();
        const controls = [...root.querySelectorAll("input, textarea, select")] as HTMLInputElement[];
        expect(controls.length).toBeGreaterThan(0);
        for (const c of controls) {
          const labelled = (c.labels?.length ?? 0) > 0 || c.hasAttribute("aria-label") || c.hasAttribute("aria-labelledby");
          expect(labelled, c.outerHTML).toBe(true);
        }
      });

      it("keeps focus indicators (no inline outline:none, :focus-visible rule present)", async () => {
        const root = await mount();
        for (const el of root.querySelectorAll<HTMLElement>("[style]")) {
          expect(el.style.outline, el.outerHTML.slice(0, 120)).not.toBe("none");
        }
        const css = [...root.querySelectorAll("style")].map((s) => s.textContent).join("\n");
        expect(css).toContain(":focus-visible");
      });

      it("presents the form as a non-submitting preview", async () => {
        const root = await mount();
        expect(root.textContent).not.toMatch(/application received/i);
        expect(root.textContent).toMatch(/preview only—this form does not submit/i);
        // The note must be announced when the field itself is focused.
        const described = root.querySelector("form input")!.getAttribute("aria-describedby");
        expect(described).toBeTruthy();
        expect(root.querySelector(`#${described}`)?.textContent).toMatch(/preview only/i);

        const form = root.querySelector("form")!;
        const input = form.querySelector("input")!;
        input.value = "someone@example.com";
        form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
        await settle();

        expect(root.textContent).not.toMatch(/application received|we'll be in touch/i);
        expect(root.textContent).toMatch(/preview only—nothing was sent/i);
        expect(input.value).toBe("");
      });
    });
  }
});

// D1 hard-codes a near-black nav bar + mobile menu panel in BOTH themes,
// so in the light theme the default ring color (fg, #1A1815) would be
// invisible on it. Every focusable in that chrome must sit under
// `.d-on-dark`, whose ring color must reach 3:1 against the panel.
describe.skipIf(!buildExists)("direction-1 light theme: mobile nav focus ring", () => {
  const hexToRgb = (hex: string) => {
    const n = parseInt(hex.replace("#", ""), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  const luminance = ([r, g, b]: number[]) => {
    const lin = (c: number) => {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  };
  const contrast = (a: number[], b: number[]) => {
    const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (l1 + 0.05) / (l2 + 0.05);
  };
  // Panel is rgba(14,15,18,0.96) over the light page bg #F5F1EA.
  const panel = [14, 15, 18].map((c, i) => Math.round(0.96 * c + 0.04 * [245, 241, 234][i]));

  it("gives panel links and the hamburger a ring that contrasts with the panel", async () => {
    const original = Object.getOwnPropertyDescriptor(window, "innerWidth");
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 400 });
    try {
      const practice = await load("content.js");
      const mountFn = await load("direction-1.js");
      const root = document.createElement("div");
      document.body.appendChild(root);
      mountFn(root, { tweaks: { dark: false }, practice });
      await settle();

      const toggle = root.querySelector<HTMLButtonElement>('nav button[aria-label="Open menu"]');
      expect(toggle).not.toBeNull();
      toggle!.click();
      await settle();

      const focusables = [...root.querySelectorAll<HTMLElement>("nav a, nav button")];
      // hamburger + 4 section links + "Request consult"
      expect(focusables.length).toBeGreaterThanOrEqual(6);
      for (const el of focusables) {
        expect(el.closest(".d-on-dark"), el.textContent ?? "").not.toBeNull();
      }

      const css = [...root.querySelectorAll("style")].map((s) => s.textContent).join("\n");
      const ring = css.match(/\.d-on-dark :focus-visible \{ outline-color: (#[0-9A-Fa-f]{6}); \}/);
      expect(ring, "missing .d-on-dark focus override").not.toBeNull();
      expect(contrast(hexToRgb(ring![1]), panel)).toBeGreaterThanOrEqual(3);
      // Sanity: the default light-theme ring (fg) would fail here.
      expect(contrast(hexToRgb("#1A1815"), panel)).toBeLessThan(3);
    } finally {
      if (original) Object.defineProperty(window, "innerWidth", original);
    }
  });
});
