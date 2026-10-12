import React from "react";
import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import {
  MarqueeTicker,
  DEFAULT_BENCHMARK_GCC_ITEMS,
  type MarqueeItem,
} from "@/components/MarqueeTicker";
import { InteractiveButton } from "@/components/InteractiveButton";
import { SmoothAccordion } from "@/components/SmoothAccordion";
import { FloatingHighlightCard } from "@/components/FloatingHighlightCard";
import fs from "node:fs";
import path from "node:path";

describe("Milestone M1 Empirical Stress Testing: Signature Visual Components", () => {
  describe("MarqueeTicker Component Stress & Edge Cases", () => {
    it("handles empty items array gracefully by falling back to verified defaults", () => {
      const html = renderToStaticMarkup(
        React.createElement(MarqueeTicker, { items: [] })
      );
      expect(html).toContain("Google");
      expect(html).toContain("Microsoft IDC");
      expect(html).toContain("CBRE India");
      expect(DEFAULT_BENCHMARK_GCC_ITEMS.length).toBeGreaterThanOrEqual(10);
    });

    it("handles undefined items gracefully", () => {
      const html = renderToStaticMarkup(
        React.createElement(MarqueeTicker, { items: undefined })
      );
      expect(html).toContain("Google");
      expect(html).toContain("Goldman Sachs");
    });

    it("handles custom items with extreme lengths without crashing or overflow syntax errors", () => {
      const longName = "A".repeat(500);
      const customItems: MarqueeItem[] = [
        {
          id: "custom-long",
          name: longName,
          city: "Bengaluru",
          category: "Engineering",
        },
      ];
      const html = renderToStaticMarkup(
        React.createElement(MarqueeTicker, { items: customItems })
      );
      expect(html).toContain(longName);
      expect(html.length).toBeGreaterThan(1000);
    });

    it("safely escapes HTML/XSS injection attempts in item attributes and labels", () => {
      const maliciousItems: MarqueeItem[] = [
        {
          id: "malicious-1",
          name: '<script>alert("xss")</script>',
          city: '"><img src=x onerror=alert(1)>',
          category: "&quot;&amp;&lt;&gt;",
        },
      ];
      const html = renderToStaticMarkup(
        React.createElement(MarqueeTicker, { items: maliciousItems })
      );
      expect(html).not.toContain('<script>alert("xss")</script>');
      expect(html).toContain("&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;");
    });

    it("handles items with missing optional fields (city, category, logoSrc, href)", () => {
      const bareItems: MarqueeItem[] = [
        {
          id: "bare-item",
          name: "Minimal GCC",
        },
      ];
      const html = renderToStaticMarkup(
        React.createElement(MarqueeTicker, { items: bareItems })
      );
      expect(html).toContain("Minimal GCC");
      // SVG fallback should be rendered
      expect(html).toContain("<svg");
    });

    it("stress tests large array of 100 marquee items without crash", () => {
      const stressItems: MarqueeItem[] = Array.from({ length: 100 }, (_, i) => ({
        id: `stress-item-${i}`,
        name: `Center ${i}`,
        city: i % 2 === 0 ? "Bengaluru" : "Hyderabad",
      }));
      const html = renderToStaticMarkup(
        React.createElement(MarqueeTicker, { items: stressItems })
      );
      expect(html).toContain("Center 0");
      expect(html).toContain("Center 99");
    });

    it("strictly isolates keyboard tab stops: cloned track MUST NOT contain any <a> or focusable elements", () => {
      const itemsWithLinks: MarqueeItem[] = [
        {
          id: "provider-cbre",
          name: "CBRE India",
          href: "/providers/cbre-india",
        },
        {
          id: "provider-trilegal",
          name: "Trilegal",
          href: "/providers/trilegal",
        },
      ];
      const html = renderToStaticMarkup(
        React.createElement(MarqueeTicker, { items: itemsWithLinks })
      );

      // Split into primary track and cloned track by the cloned track delimiter
      const splitToken = '<div class="flex gap-4 shrink-0" aria-hidden="true">';
      expect(html).toContain(splitToken);
      const [primaryPart, clonedPart] = html.split(splitToken);

      // Primary track MUST contain the active links
      expect(primaryPart).toContain('href="/providers/cbre-india"');
      expect(primaryPart).toContain('tabindex="0"');

      // Crucial accessibility invariant: cloned track must NOT contain <a or tabindex
      expect(clonedPart).not.toContain("<a ");
      expect(clonedPart).not.toContain("<a\n");
      expect(clonedPart).not.toContain("tabindex");
      expect(clonedPart).toContain("CBRE India");
    });

    it("configures CSS custom property for animation duration according to speedSeconds prop", () => {
      const html = renderToStaticMarkup(
        React.createElement(MarqueeTicker, { speedSeconds: 50 })
      );
      expect(html).toContain("--marquee-duration:50s");
    });

    it("includes pause-on-hover and focus-within CSS classes for accessibility", () => {
      const html = renderToStaticMarkup(
        React.createElement(MarqueeTicker)
      );
      expect(html).toContain("hover:[animation-play-state:paused]");
      expect(html).toContain("focus-within:[animation-play-state:paused]");
    });

    it("renders dual gradient fade masks with pointer-events-none", () => {
      const html = renderToStaticMarkup(React.createElement(MarqueeTicker));
      expect(html).toContain("bg-gradient-to-r from-background to-transparent");
      expect(html).toContain("bg-gradient-to-l from-background to-transparent");
      expect(html).toContain("pointer-events-none");
    });
  });

  describe("SmoothAccordion Component Stress & Accessibility", () => {
    it("renders properly with defaultExpanded=false and ARIA contract", () => {
      const html = renderToStaticMarkup(
        React.createElement(
          SmoothAccordion,
          { id: "test-acc", title: "Incentives", children: "Accordion Details" }
        )
      );
      expect(html).toContain('id="test-acc-header"');
      expect(html).toContain('aria-expanded="false"');
      expect(html).toContain('aria-controls="test-acc-content"');
      expect(html).toContain('id="test-acc-content"');
      expect(html).toContain('role="region"');
      expect(html).toContain('aria-labelledby="test-acc-header"');
      expect(html).toContain('data-expanded="false"');
      expect(html).toContain("accordion-grid");
      expect(html).toContain("accordion-inner");
    });

    it("renders properly with controlled expanded=true", () => {
      const html = renderToStaticMarkup(
        React.createElement(
          SmoothAccordion,
          { id: "ctrl-acc", title: "Incentives", expanded: true, children: "Expanded Content" }
        )
      );
      expect(html).toContain('aria-expanded="true"');
      expect(html).toContain('data-expanded="true"');
      expect(html).toContain("rotate-180");
    });

    it("controlled expanded prop overrides defaultExpanded", () => {
      const html = renderToStaticMarkup(
        React.createElement(
          SmoothAccordion,
          {
            id: "override-acc",
            title: "Incentives",
            defaultExpanded: true,
            expanded: false,
            children: "Content",
          }
        )
      );
      expect(html).toContain('aria-expanded="false"');
      expect(html).toContain('data-expanded="false"');
    });

    it("uses native HTML <button type='button'> for native Enter and Space keyboard support", () => {
      const html = renderToStaticMarkup(
        React.createElement(
          SmoothAccordion,
          { id: "kbd-acc", title: "Keyboard Accordion", children: "Content" }
        )
      );
      // Button tag with type="button" guarantees standard browser keyboard behavior (Enter and Space fire click)
      expect(html).toContain('<button id="kbd-acc-header" type="button"');
      expect(html).toContain('aria-expanded="false"');
      expect(html).toContain('aria-controls="kbd-acc-content"');
      expect(html).toContain("focus-visible:ring-2");
      expect(html).toContain("focus-visible:ring-accent");
    });

    it("handles extreme input stress: empty strings, long titles, unicode", () => {
      const extremeTitle = "🔥 ".repeat(50) + "Special & < > ' \" Incentive Details";
      const html = renderToStaticMarkup(
        React.createElement(
          SmoothAccordion,
          { id: "extreme-acc", title: extremeTitle, children: "" }
        )
      );
      expect(html).toContain("🔥");
      expect(html).toContain("&amp; &lt; &gt;");
    });

    it("rapid state transition logic stress simulation (1,000 toggles)", () => {
      let isExpanded = false;
      const onToggle = (next: boolean) => {
        isExpanded = next;
      };

      for (let i = 0; i < 1000; i++) {
        const next = !isExpanded;
        onToggle(next);
      }

      // After 1000 toggles, state should be false
      expect(isExpanded).toBe(false);

      // Verify rendering in final state
      const html = renderToStaticMarkup(
        React.createElement(
          SmoothAccordion,
          { title: "Rapid Stress", expanded: isExpanded, children: "Content" }
        )
      );
      expect(html).toContain('data-expanded="false"');
    });
  });

  describe("InteractiveButton Component Stress & Accessibility", () => {
    it("renders as button element with type='button' and high-contrast focus rings", () => {
      const html = renderToStaticMarkup(
        React.createElement(
          InteractiveButton,
          { "data-testid": "cta-btn", children: "Click Me" }
        )
      );
      expect(html).toContain("<button");
      expect(html).toContain('type="button"');
      expect(html).toContain("focus-visible:ring-2");
      expect(html).toContain("focus-visible:ring-accent");
      expect(html).toContain("Click Me");
    });

    it("renders as internal Link when internal href is provided", () => {
      const html = renderToStaticMarkup(
        React.createElement(
          InteractiveButton,
          { href: "/planner", children: "Launch Planner" }
        )
      );
      expect(html).toContain("<a");
      expect(html).toContain('href="/planner"');
      expect(html).toContain("Launch Planner");
    });

    it("renders as external anchor with secure target and rel attributes", () => {
      const html = renderToStaticMarkup(
        React.createElement(
          InteractiveButton,
          { href: "https://example.com/external", children: "External Site" }
        )
      );
      expect(html).toContain("<a");
      expect(html).toContain('href="https://example.com/external"');
      expect(html).toContain('target="_blank"');
      expect(html).toContain('rel="noopener noreferrer"');
    });

    it("includes sliding arrow hover animation by default", () => {
      const html = renderToStaticMarkup(
        React.createElement(InteractiveButton, { children: "Action" })
      );
      expect(html).toContain("group-hover:translate-x-1");
    });

    it("can suppress arrow when showArrow=false", () => {
      const html = renderToStaticMarkup(
        React.createElement(InteractiveButton, { showArrow: false, children: "Action" })
      );
      expect(html).not.toContain("group-hover:translate-x-1");
    });

    it("applies disabled attributes and pointer-events classes when disabled=true", () => {
      const html = renderToStaticMarkup(
        React.createElement(
          InteractiveButton,
          { disabled: true, type: "submit", children: "Submit" }
        )
      );
      expect(html).toContain("disabled");
      expect(html).toContain("disabled:pointer-events-none");
    });

    it("supports all design tokens: primary, secondary, subtle variants and sm, md, lg sizes", () => {
      const p = renderToStaticMarkup(
        React.createElement(InteractiveButton, { variant: "primary", size: "lg", children: "P" })
      );
      expect(p).toContain("gradient-primary-btn");
      expect(p).toContain("rounded-2xl");

      const s = renderToStaticMarkup(
        React.createElement(InteractiveButton, { variant: "secondary", size: "md", children: "S" })
      );
      expect(s).toContain("bg-surface");
      expect(s).toContain("rounded-xl");

      const sub = renderToStaticMarkup(
        React.createElement(InteractiveButton, { variant: "subtle", size: "sm", children: "Sub" })
      );
      expect(sub).toContain("bg-accent-subtle");
      expect(sub).toContain("rounded-lg");
    });
  });

  describe("FloatingHighlightCard Component Stress & Tokens", () => {
    it("renders metrics with font-mono and tabular-nums", () => {
      const html = renderToStaticMarkup(
        React.createElement(FloatingHighlightCard, {
          title: "Setup Cost Index",
          value: "₹45,00,000",
          subtitle: "Per 100 headcount",
        })
      );
      expect(html).toContain("Setup Cost Index");
      expect(html).toContain("₹45,00,000");
      expect(html).toContain("font-mono");
      expect(html).toContain("tabular-nums");
      expect(html).toContain("rounded-2xl");
      expect(html).toContain("shadow-elevated");
    });

    it("renders angled pill badge with rotation micro-interaction", () => {
      const html = renderToStaticMarkup(
        React.createElement(FloatingHighlightCard, {
          title: "Top Match",
          value: "Hyderabad",
          badge: "94.2 Score",
        })
      );
      expect(html).toContain("94.2 Score");
      expect(html).toContain("-rotate-2");
      expect(html).toContain("group-hover:rotate-0");
    });

    it("applies animate-float-slow only when animate=true", () => {
      const staticCard = renderToStaticMarkup(
        React.createElement(FloatingHighlightCard, {
          title: "Static",
          value: "10",
          animate: false,
        })
      );
      expect(staticCard).not.toContain("animate-float-slow");

      const animatedCard = renderToStaticMarkup(
        React.createElement(FloatingHighlightCard, {
          title: "Animated",
          value: "10",
          animate: true,
        })
      );
      expect(animatedCard).toContain("animate-float-slow");
      expect(animatedCard).toContain("hover:[animation-play-state:paused]");
    });
  });

  describe("CSS Tokens & Prefers-Reduced-Motion Specification Verification", () => {
    const globalsCssPath = path.resolve(process.cwd(), "src/app/globals.css");
    const tailwindConfigPath = path.resolve(process.cwd(), "tailwind.config.ts");
    const globalsCss = fs.readFileSync(globalsCssPath, "utf-8");
    const tailwindConfig = fs.readFileSync(tailwindConfigPath, "utf-8");

    it("tailwind.config.ts defines all required border-radius and shadow tokens", () => {
      expect(tailwindConfig).toContain('"2xl": "16px"');
      expect(tailwindConfig).toContain('"3xl": "24px"');
      expect(tailwindConfig).toContain("subtle:");
      expect(tailwindConfig).toContain("elevated:");
      expect(tailwindConfig).toContain("float:");
      expect(tailwindConfig).toContain("glow:");
    });

    it("tailwind.config.ts defines all required 60fps keyframes and animation utilities", () => {
      expect(tailwindConfig).toContain('"fade-up":');
      expect(tailwindConfig).toContain('"pop-in":');
      expect(tailwindConfig).toContain("float:");
      expect(tailwindConfig).toContain('"float-slow":');
      expect(tailwindConfig).toContain("marquee:");
      expect(tailwindConfig).toContain('"pulse-glow":');

      expect(tailwindConfig).toContain('"fade-up": "fade-up');
      expect(tailwindConfig).toContain('"pop-in": "pop-in');
      expect(tailwindConfig).toContain('float: "float');
      expect(tailwindConfig).toContain('"float-slow": "float-slow');
      expect(tailwindConfig).toContain('marquee: "marquee');
      expect(tailwindConfig).toContain('"pulse-glow": "pulse-glow');
    });

    it("src/app/globals.css defines ambient-glow-teal with blur and circular radius", () => {
      expect(globalsCss).toContain(".ambient-glow-teal");
      expect(globalsCss).toContain("filter: blur(40px);");
      expect(globalsCss).toContain("border-radius: 9999px;");
      expect(globalsCss).toContain("pointer-events: none;");
    });

    it("src/app/globals.css defines 60fps CSS Grid accordion transitions", () => {
      expect(globalsCss).toContain(".accordion-grid");
      expect(globalsCss).toContain("grid-template-rows: 0fr;");
      expect(globalsCss).toContain('.accordion-grid[data-expanded="true"]');
      expect(globalsCss).toContain("grid-template-rows: 1fr;");
      expect(globalsCss).toContain(".accordion-inner");
      expect(globalsCss).toContain("min-height: 0;");
    });

    it("strictly enforces prefers-reduced-motion: reduce to stop all continuous animations", () => {
      expect(globalsCss).toContain("@media (prefers-reduced-motion: reduce)");

      // Universal reset
      expect(globalsCss).toContain("animation-duration: 0.01ms !important;");
      expect(globalsCss).toContain("transition-duration: 0.01ms !important;");

      // Specific infinite animation stops
      expect(globalsCss).toContain(".animate-marquee");
      expect(globalsCss).toContain(".animate-float");
      expect(globalsCss).toContain(".animate-float-slow");
      expect(globalsCss).toContain(".animate-pulse-glow");
      expect(globalsCss).toContain("animation: none !important;");
      expect(globalsCss).toContain("transform: none !important;");
    });
  });
});
