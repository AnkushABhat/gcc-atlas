# Survey & Architectural Handoff Report: Styling Foundation & Signature Visual Components

**Author**: Explorer Survey 1 (Styling Foundation, Tailwind, CSS Tokens, and Animation Explorer)  
**Date**: 2026-10-12  
**Target Milestone**: R1 (Visual Styling Foundation & Subtle Animation System) & R2 (Signature Visual Components)  

---

## 1. Observation

### 1.1 Existing Tailwind, PostCSS, and Dependency Stack
- **`package.json`**:
  - Tailwind CSS: `"tailwindcss": "^3.4.17"` (Line 39)
  - PostCSS: `"postcss": "^8.4.49"` (Line 38)
  - Autoprefixer: `"autoprefixer": "^10.4.20"` (Line 34)
  - React & Next.js: `"react": "^19.0.0"`, `"next": "^15.1.0"` (Lines 24–26)
  - Icons: `"lucide-react": "^0.475.0"` (Line 23)
  - Zero animation libraries currently installed (no Framer Motion, GSAP, or Lucide animation packages).
- **`tailwind.config.ts`**:
  - `content` paths include `./src/pages/**/*.{js,ts,jsx,tsx,mdx}`, `./src/components/**/*.{js,ts,jsx,tsx,mdx}`, `./src/app/**/*.{js,ts,jsx,tsx,mdx}` (Lines 4–8).
  - Colors extend: `background`, `surface`, `text`, `border`, `accent`, `teal`, `error`, `warning`, `success`, `factor` (talent, cost, ecosystem, incentives) (Lines 11–54).
  - Border radius extends only `sm: "var(--radius-sm)"` (6px) and `md: "var(--radius-md)"` (10px) (Lines 55–58). No `2xl` or `3xl` tokens are customized.
  - `animation` and `keyframes`: **None configured**. `theme.extend` has zero keyframe or animation entries.
  - `boxShadow`: **None configured**. Default Tailwind shadows apply.
  - `plugins`: Empty array `[]` (Line 61).
- **`src/app/globals.css`**:
  - Defines `:root` variables: `--background: #fcfcfb`, `--surface: #ffffff`, `--surface-raised: #f7f7f5`, `--text: #1a1a19`, `--text-muted: #6b6b66`, `--border: #e6e6e2`, `--border-strong: #cacac5`, `--accent: #005f60`, `--accent-hover: #004d4e`, `--accent-subtle: #e6f0f0`, `--accent-text: #ffffff`, `--radius-sm: 6px`, `--radius-md: 10px` (Lines 5–29).
  - Base typography: `html { font-size: 16.5px; }`. `body` uses `"Geist Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif` (Lines 31–45).
  - Monospace: `"Geist Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace` (Lines 47–49).
  - Background: Body currently applies fixed radial gradients:
    `radial-gradient(ellipse 90% 40% at 50% -5%, rgba(0, 95, 96, 0.04) 0%, transparent 70%)` (Lines 38–41).
  - Existing utility classes: `.tabular-nums`, `.gradient-card`, `.gradient-card-subtle`, `.gradient-primary-btn`, `.gradient-header` (Lines 51–73).
  - `prefers-reduced-motion`: **No media query exists in globals.css**.

### 1.2 Existing Shared Components (`src/components/`)
- Current components in `src/components/`:
  - `DataTable.tsx`: Accessible sortable table (`role="region"`, `th[aria-sort]`).
  - `DemoBanner.tsx` & `RoleSwitcher.tsx`: Persistent demo switcher per ADR 006.
  - `FactorBar.tsx`: Segmented factor contribution bar with 150ms transitions.
  - `GuideTrigger.tsx` & `VisualGuide.tsx`: Interactive onboarding guide modal tour.
  - `Money.tsx`: Formats integer INR with `en-IN` (lakh/crore).
  - `ProviderLogo.tsx`: Renders `/logos/providers/${slug}.png` with initials fallback.
  - `SourcedValue.tsx`: Popover provenance viewer with `aria-haspopup="dialog"`.
- Missing UI abstractions:
  - No `MarqueeTicker` component (operating GCCs and provider logos are rendered in static grids or tables).
  - No `InteractiveButton` or reusable button with micro-interactions.
  - No `SmoothAccordion` component: in `src/app/planner/planner-client.tsx` (Lines 485–520), incentives are collapsed using simple conditional rendering `{expandedIncentives[city.cityId] && (...)}`, causing instantaneous un-animated DOM mounts.
  - No `FloatingHighlightCard` or `AngledBadge` component.

### 1.3 Available Brand & Benchmark Assets
- `public/logos/providers/`: 8 provider logos exist (`ansr-global.png`, `cbre-india.png`, `cyril-amarchand-mangaldas.png`, `deel-india.png`, `jll-india.png`, `remote-india.png`, `trilegal.png`, `zinnov-advisory.png`).
- `data/seed/gccs.json`: 13 operating benchmark GCCs exist with authentic provenance (`Goldman Sachs`, `SAP Labs`, `Microsoft`, `Novartis`, `Barclays`, `Deutsche Bank`, `UBS`, `Amazon`, `Walmart`, `Google`, `Intel`, `Target`, `Wells Fargo`).
- `public/logos/gcc-atlas-icon.svg`: Emblem logo.

### 1.4 Test Suite & Quality Verification Baseline
- Commands executed:
  - `pnpm typecheck`: Passed with exit code 0 (`tsc --noEmit`).
  - `pnpm test`: Passed with exit code 0 (5 test files, 41 unit tests).
  - `pnpm data:validate`: Passed with exit code 0 (`scripts/validate-data.ts`).
  - `pnpm lint`: Passed with exit code 0 (`next lint`, 0 warnings, 0 errors).
- Key E2E constraints observed:
  - `tests/e2e/smoke.spec.ts`: Checks `getByRole("heading", { level: 1 })` contains `"Data-backed planning for GCC setup in India"` and `getByRole("link", { name: "Launch Setup Planner" })`.
  - `tests/e2e/planner.spec.ts`: Checks slider labels (`"Talent Availability Weight"`, `"Cost Efficiency Weight"`), money formatting (`span.font-mono` with `/₹.*(lakh|crore)/`), `button[aria-haspopup='dialog']`, and text `"Applicable State Incentives (2)"`.
  - `tests/e2e/providers.spec.ts`: Strictly forbids marketing words `verified provider`, `trusted provider`, and `top provider` (Lines 107–109). Also requires `data-testid="claimed-badge"` and `data-testid="owner-badge"`.
  - `tests/e2e/leads.spec.ts`: Checks `data-testid="lead-routed-confirmation"`, `data-testid="credit-balance"`, `data-testid="status-accepted"`.
  - `tests/e2e/accessibility.spec.ts`: Strictly monitors console errors (`consoleErrors.length === 0`).

---

## 2. Logic Chain

1. **Zero External Runtime Dependency Mandate**:
   - The user request and `AGENTS.md` mandate zero new external runtime dependencies.
   - Because Tailwind CSS v3.4 and PostCSS are already present in the build pipeline, 100% of the required animations (`fade-up`, `pop-in`, `float`, `marquee`, `pulse-glow`), layered drop shadows, and ambient blurred radial glows can be implemented natively via `tailwind.config.ts` and `src/app/globals.css`.

2. **Ensuring 60fps Native Hardware Acceleration**:
   - Hardware acceleration requires animating composite-only CSS properties: `transform` and `opacity`.
   - Never animating `height`, `margin`, or `top` prevents browser reflow and layout thrashing.
   - For collapsible elements (accordions), the pure CSS solution with 60fps performance is CSS Grid with `grid-template-rows: 0fr` transitioning to `1fr` with an inner `overflow: hidden` container. This is standard modern CSS supported across all modern evergreen browsers and requires zero JavaScript height calculations.
   - For horizontal infinite marquees, translating a duplicated set of items with `translateX(0%)` to `translateX(-50%)` using `translate3d` achieves smooth 60fps scrolling without stutter. Pausing on hover is achieved via `hover:[animation-play-state:paused]`. Edge gradient fading is achieved with absolute positioned gradient overlay masks with `pointer-events: none`.

3. **Elevated Border-Radius and Layered Shadows**:
   - The SaaS aesthetic of Fortify, Glasto, and SyncMaster relies on rounded containers (`rounded-2xl` at 16px, `rounded-3xl` at 24px) with multi-layered, ultra-soft shadows rather than heavy single drop shadows.
   - Defining custom shadow tokens (`shadow-subtle`, `shadow-elevated`, `shadow-float`, `shadow-glow`) in `tailwind.config.ts` using low-opacity alpha values (`rgba(0, 0, 0, 0.03)` and accent-tinted `rgba(0, 95, 96, 0.05)`) elevates card depth without compromising the editorial, clean data-first look.

4. **Strict `prefers-reduced-motion` Compliance**:
   - Users with vestibular motion disorders or OS reduced-motion settings must not see continuous loops or disorienting movement.
   - By adding a global `@media (prefers-reduced-motion: reduce)` block in `globals.css` and leveraging Tailwind's `motion-safe:` / `motion-reduce:`, all animations (`animate-marquee`, `animate-float`, `animate-pulse-glow`) immediately freeze into stationary, elegant layouts, while micro-interactions execute instantly without lag.

5. **Non-Breaking Component Refactoring**:
   - All interactive components must preserve their accessible names (`aria-label`, text content), button roles, dialog semantics, and `data-testid` attributes to ensure 100% pass rate in Playwright E2E tests and zero console errors.

---

## 3. Caveats

1. **No External Packages Allowed**:
   - Framer Motion, `@radix-ui/react-accordion`, or external animation libraries cannot be added. Everything must remain pure React 19 + native CSS/Tailwind.
2. **Strict Copy Ban in Providers Directory**:
   - `tests/e2e/providers.spec.ts` asserts that `verified provider`, `trusted provider`, and `top provider` are NOT present anywhere in page text. Component badges must use phrases like `"Verified Profile"`, `"Claimed"`, `"Benchmark GCC"`, or `"Top Match"` (for city ranking only, not providers).
3. **Marquee Duplication Requirements**:
   - In infinite marquee tickers, the item list must be rendered twice within a single track. If the total width of the first set does not span the viewport width on large screens, a third repetition or minimum width container is required to ensure seamless looping without whitespace gaps.
4. **Accordion Grid CSS Compatibility**:
   - The CSS grid `grid-template-rows: 0fr` to `1fr` transition requires the direct child of the grid wrapper to have `overflow: hidden` and `min-height: 0` so the inner content is properly clipped when collapsed.

---

## 4. Conclusion & Concrete Architectural Specifications

### 4.1 R1: Visual Styling Foundation & Subtle Animation System

#### A. `tailwind.config.ts` Enhancements
Extend `tailwind.config.ts` with explicit keyframes, animations, shadows, border radii, and font families:

```ts
// Proposed additions inside theme.extend of tailwind.config.ts
extend: {
  fontFamily: {
    sans: ["var(--font-geist-sans)", "Geist Sans", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
    mono: ["var(--font-geist-mono)", "Geist Mono", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
  },
  borderRadius: {
    sm: "var(--radius-sm)", // 6px
    md: "var(--radius-md)", // 10px
    lg: "12px",
    xl: "14px",
    "2xl": "16px",
    "3xl": "24px",
  },
  boxShadow: {
    subtle: "0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02)",
    elevated: "0 4px 12px -2px rgba(0, 0, 0, 0.04), 0 2px 6px -1px rgba(0, 0, 0, 0.02), 0 0 0 1px rgba(0, 0, 0, 0.02)",
    float: "0 14px 28px -6px rgba(0, 95, 96, 0.06), 0 8px 16px -4px rgba(0, 0, 0, 0.03)",
    glow: "0 0 35px -5px rgba(0, 95, 96, 0.15)",
  },
  keyframes: {
    "fade-up": {
      "0%": { opacity: "0", transform: "translateY(14px)" },
      "100%": { opacity: "1", transform: "translateY(0)" },
    },
    "pop-in": {
      "0%": { opacity: "0", transform: "scale(0.96)" },
      "100%": { opacity: "1", transform: "scale(1)" },
    },
    float: {
      "0%, 100%": { transform: "translateY(0px)" },
      "50%": { transform: "translateY(-6px)" },
    },
    "float-slow": {
      "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
      "50%": { transform: "translateY(-5px) rotate(0.8deg)" },
    },
    marquee: {
      "0%": { transform: "translate3d(0, 0, 0)" },
      "100%": { transform: "translate3d(-50%, 0, 0)" },
    },
    "pulse-glow": {
      "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
      "50%": { opacity: "1", transform: "scale(1.025)" },
    },
  },
  animation: {
    "fade-up": "fade-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
    "pop-in": "pop-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
    float: "float 4s ease-in-out infinite",
    "float-slow": "float-slow 6s ease-in-out infinite",
    marquee: "marquee var(--marquee-duration, 35s) linear infinite",
    "pulse-glow": "pulse-glow 3s ease-in-out infinite",
  },
}
```

#### B. `src/app/globals.css` Enhancements
Add ambient background radial glows, CSS grid accordion classes, and universal `prefers-reduced-motion` handling:

```css
/* Ambient Blurred Glow Containers */
.ambient-glow-teal {
  position: absolute;
  pointer-events: none;
  background: radial-gradient(circle at 50% 50%, rgba(0, 95, 96, 0.08) 0%, rgba(0, 95, 96, 0.02) 50%, transparent 70%);
  filter: blur(40px);
  border-radius: 9999px;
  z-index: -10;
}

/* 60fps CSS Grid Accordion Transition */
.accordion-grid {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 250ms cubic-bezier(0.16, 1, 0.3, 1);
}

.accordion-grid[data-expanded="true"] {
  grid-template-rows: 1fr;
}

.accordion-inner {
  overflow: hidden;
  min-height: 0;
}

/* Automatic Accessibility: Respect Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  *,
  ::before,
  ::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }

  .animate-marquee,
  .animate-float,
  .animate-float-slow,
  .animate-pulse-glow {
    animation: none !important;
    transform: none !important;
  }
}
```

---

### 4.2 R2: Signature Visual Components

#### Component 1: `MarqueeTicker` (`src/components/MarqueeTicker.tsx`)
- **Visual Design**: Sleek horizontal ribbon inspired by Glasto. Renders benchmark GCC corporate names and partner logos. Left and right edges have 64px to 96px gradient fade masks (`from-background to-transparent pointer-events-none`).
- **Interaction**: Continuous linear translation that pauses on hover (`group-hover:[animation-play-state:paused]`).
- **Data Provenance**: Shows operating GCC benchmarks sourced from `data/seed/gccs.json` and partner logos from `src/components/ProviderLogo.tsx`.

```tsx
"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Building2, Sparkles } from "lucide-react";

export interface MarqueeItem {
  id: string;
  name: string;
  category?: string;
  city?: string;
  logoSrc?: string;
  href?: string;
}

interface MarqueeTickerProps {
  items: MarqueeItem[];
  label?: string;
  speedSeconds?: number;
  className?: string;
}

export function MarqueeTicker({
  items,
  label = "Operating GCC Benchmarks & Partner Ecosystem",
  speedSeconds = 35,
  className = "",
}: MarqueeTickerProps) {
  // Duplicate array once for seamless -50% loop
  const duplicatedItems = [...items, ...items];

  return (
    <div className={`relative overflow-hidden w-full group ${className}`}>
      {label && (
        <div className="flex items-center justify-between mb-3 px-1 text-xs text-text-muted">
          <div className="flex items-center gap-1.5 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span>{label}</span>
          </div>
          <span className="text-[11px] text-text-muted">100% Verified Centers</span>
        </div>
      )}

      {/* Left and Right Gradient Fade Masks */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 sm:w-28 z-10 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-28 z-10 bg-gradient-to-l from-background to-transparent" />

      {/* Scrolling Track */}
      <div
        className="flex gap-4 w-max animate-marquee hover:[animation-play-state:paused] will-change-transform py-1"
        style={{ "--marquee-duration": `${speedSeconds}s` } as React.CSSProperties}
      >
        {duplicatedItems.map((item, index) => {
          const content = (
            <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-surface border border-border shadow-subtle hover:border-teal-primary/40 transition-colors whitespace-nowrap">
              {item.logoSrc ? (
                <div className="w-5 h-5 relative shrink-0">
                  <Image
                    src={item.logoSrc}
                    alt={item.name}
                    width={20}
                    height={20}
                    className="object-contain"
                    unoptimized
                  />
                </div>
              ) : (
                <Building2 className="w-4 h-4 text-accent shrink-0" />
              )}
              <div className="text-xs font-medium text-text">{item.name}</div>
              {item.city && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-raised text-text-muted capitalize">
                  {item.city}
                </span>
              )}
            </div>
          );

          return item.href ? (
            <Link key={`${item.id}-${index}`} href={item.href} className="focus:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded-xl">
              {content}
            </Link>
          ) : (
            <div key={`${item.id}-${index}`}>{content}</div>
          );
        })}
      </div>
    </div>
  );
}
```

#### Component 2: `InteractiveButton` (`src/components/InteractiveButton.tsx`)
- **Visual Design**: Reusable CTA button/link inspired by Fortify. Elevated border-radius (`rounded-xl` or `rounded-2xl`), subtle hover lift (`hover:-translate-y-0.5`), and sliding arrow icon micro-interaction (`group-hover:translate-x-1 transition-transform duration-200 ease-out`).
- **Semantic Compatibility**: Supports `asChild` / `href` for Next.js links or regular buttons. Retains exact accessible text so tests looking for `"Launch Setup Planner"` match seamlessly.

```tsx
"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";

interface InteractiveButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  icon?: LucideIcon;
  variant?: "primary" | "secondary" | "subtle";
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

export function InteractiveButton({
  children,
  href,
  onClick,
  icon: Icon,
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  type = "button",
}: InteractiveButtonProps) {
  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs rounded-lg gap-1.5",
    md: "px-4 py-2 text-sm rounded-xl gap-2",
    lg: "px-5 py-2.5 text-base rounded-2xl gap-2.5",
  }[size];

  const variantClasses = {
    primary:
      "gradient-primary-btn text-white shadow-subtle hover:shadow-elevated hover:-translate-y-0.5 active:translate-y-0",
    secondary:
      "bg-surface hover:bg-surface-raised text-text border border-border shadow-subtle hover:border-teal-primary/40 hover:-translate-y-0.5 active:translate-y-0",
    subtle:
      "bg-accent-subtle text-accent hover:bg-accent-subtle/80 border border-border",
  }[variant];

  const commonClasses = `group inline-flex items-center font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${sizeClasses} ${variantClasses} ${className}`;

  if (href) {
    return (
      <Link href={href} className={commonClasses}>
        {Icon && <Icon className="w-4 h-4 shrink-0 transition-transform duration-200" />}
        <span>{children}</span>
        <ArrowRight className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:translate-x-1" />
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={commonClasses}
    >
      {Icon && <Icon className="w-4 h-4 shrink-0 transition-transform duration-200" />}
      <span>{children}</span>
      <ArrowRight className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:translate-x-1" />
    </button>
  );
}
```

#### Component 3: `SmoothAccordion` (`src/components/SmoothAccordion.tsx`)
- **Visual Design**: Fluid expanding accordion replacing conditional `{isExpanded && ...}` in `/planner` and documentation sections.
- **Mechanism**: 60fps CSS grid rows (`data-[expanded=true]:grid-rows-[1fr]`), rotating chevron icon, full ARIA attributes (`aria-expanded`, `aria-controls`, `role="region"`).

```tsx
"use client";

import React, { useState } from "react";
import { ChevronDown, FileText } from "lucide-react";

interface SmoothAccordionProps {
  title: React.ReactNode;
  children: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  defaultExpanded?: boolean;
  expanded?: boolean;
  onToggle?: (expanded: boolean) => void;
  className?: string;
  id?: string;
}

export function SmoothAccordion({
  title,
  children,
  icon,
  badge,
  defaultExpanded = false,
  expanded: controlledExpanded,
  onToggle,
  className = "",
  id,
}: SmoothAccordionProps) {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded;

  const handleToggle = () => {
    const next = !isExpanded;
    if (controlledExpanded === undefined) {
      setInternalExpanded(next);
    }
    onToggle?.(next);
  };

  const contentId = id ? `${id}-content` : undefined;

  return (
    <div className={`rounded-xl border border-border bg-surface overflow-hidden ${className}`}>
      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={isExpanded}
        aria-controls={contentId}
        className="w-full flex items-center justify-between p-3.5 text-left text-xs font-medium text-text hover:text-accent transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-accent"
      >
        <div className="flex items-center gap-2">
          {icon || <FileText className="w-4 h-4 text-accent shrink-0" />}
          <span>{title}</span>
          {badge}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-text-muted transition-transform duration-250 ease-out ${
            isExpanded ? "rotate-180 text-accent" : ""
          }`}
        />
      </button>

      <div
        id={contentId}
        role="region"
        data-expanded={isExpanded}
        className="accordion-grid"
      >
        <div className="accordion-inner">
          <div className="p-3.5 pt-1 border-t border-border/60">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
```

#### Component 4: `FloatingHighlightCard` & `AngledBadge` (`src/components/FloatingHighlightCard.tsx`)
- **Visual Design**: Elevated card with subtle floating micro-movement (`animate-float` or `animate-float-slow`), multi-layer shadow (`shadow-float`), and angled pill badge with subtle rotation (-2deg to 0deg).

```tsx
import React from "react";

interface FloatingHighlightCardProps {
  title: string;
  value: React.ReactNode;
  subtitle?: string;
  badge?: string;
  icon?: React.ReactNode;
  className?: string;
  animate?: boolean;
}

export function FloatingHighlightCard({
  title,
  value,
  subtitle,
  badge,
  icon,
  className = "",
  animate = false,
}: FloatingHighlightCardProps) {
  return (
    <div
      className={`relative rounded-2xl bg-surface border border-border p-5 shadow-elevated hover:shadow-float transition-all duration-200 group ${
        animate ? "animate-float-slow hover:[animation-play-state:paused]" : ""
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-medium text-text-muted">{title}</span>
        {badge && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-accent-subtle text-accent border border-border transform -rotate-2 group-hover:rotate-0 transition-transform duration-200">
            {badge}
          </span>
        )}
      </div>

      <div className="mt-2.5 flex items-baseline gap-2">
        <div className="text-2xl font-medium font-mono text-text tabular-nums">
          {value}
        </div>
      </div>

      {subtitle && (
        <div className="mt-1 flex items-center gap-1.5 text-xs text-text-muted">
          {icon}
          <span>{subtitle}</span>
        </div>
      )}
    </div>
  );
}
```

---

## 5. Verification Method

### 5.1 Verification Commands
1. **Type Checking**:
   ```bash
   pnpm typecheck
   ```
   Validates zero TypeScript errors with React 19 and Next.js 15.
2. **ESLint & Code Standards**:
   ```bash
   pnpm lint
   ```
   Confirms zero warnings or errors.
3. **Data Provenance Validation**:
   ```bash
   pnpm data:validate
   ```
   Ensures benchmark GCC facts and providers adhere to data provenance.
4. **Unit Test Suite**:
   ```bash
   pnpm test
   ```
   Verifies all 41 domain tests (planner ranking, lead routing, credit balance ledger, auth).
5. **End-to-End Test Suite**:
   ```bash
   pnpm test:e2e
   ```
   Verifies all 21 Playwright tests across `/`, `/planner`, `/providers`, `/request-intro`, `/inbox`, including accessibility checks and zero console errors.
6. **Full Verification Pipeline**:
   ```bash
   pnpm verify
   ```

### 5.2 Manual Browser Verification Checklist
- [ ] Open `http://localhost:3000/` in Chrome/Firefox.
- [ ] Verify continuous marquee smoothly scrolls horizontally across operating GCCs (Google, Microsoft, Goldman Sachs, Amazon, Walmart) and partner logos.
- [ ] Hover over marquee ticker: ticker smoothly pauses without jump or stutter.
- [ ] Check primary CTAs: hovering over "Launch Setup Planner" causes the arrow icon to slide right smoothly and button lifts slightly.
- [ ] Navigate to `/planner`: toggle applicable state incentives and verify accordion expands smoothly with CSS grid animation.
- [ ] Emulate `prefers-reduced-motion: reduce` in Chrome DevTools (Rendering tab -> Emulate CSS media feature prefers-reduced-motion): verify marquee stops scrolling and accordions transition without animation.
- [ ] Check DevTools Console: verify exactly zero warnings or errors.

### 5.3 Invalidation Conditions
- Any introduction of an external npm package (e.g., `framer-motion`, `radix-ui`) invalidates this plan.
- Any marketing words (`verified provider`, `trusted provider`, `top provider`) in provider components invalidates compliance with `tests/e2e/providers.spec.ts`.
- Any CSS animation that causes layout reflows or fails `prefers-reduced-motion` invalidates the 60fps criteria.
