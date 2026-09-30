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
