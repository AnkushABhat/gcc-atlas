"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Compass,
  Building2,
  Users,
  Coins,
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle2,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";

export function openVisualGuide() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("open-visual-guide"));
  }
}

interface StepContent {
  id: string;
  stepNumber: number;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  ruleHighlight: string;
  linkText: string;
  linkHref: string;
  mockup: React.ReactNode;
}

const STEPS: StepContent[] = [
  {
    id: "planner",
    stepNumber: 1,
    icon: Compass,
    title: "Model Location Priorities & Costs",
    description:
      "Configure your planned headcount and strategic weights across Talent Availability, Commercial Rent, Ecosystem Density, and State Incentives. Rankings update in real time.",
    ruleHighlight:
      "Every number cites an official source URL & as-of date (ADR 003). Cities with missing metrics are never guessed (ADR 004).",
    linkText: "Try Setup Planner",
    linkHref: "/planner",
    mockup: (
      <div className="bg-background rounded border border-border p-3 space-y-2 text-xs">
        <div className="flex items-center justify-between text-[11px] pb-1.5 border-b border-border">
          <span className="font-medium text-text">Priority Weights</span>
          <span className="text-text-muted font-mono">Talent 40% &middot; Rent 30%</span>
        </div>
        <div className="bg-surface rounded border border-border p-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-accent-subtle text-accent font-mono text-[10px] font-medium flex items-center justify-center">
              #1
            </span>
            <div>
              <div className="font-medium text-text">Bengaluru</div>
              <div className="text-[10px] text-text-muted">Grade-A Rent: ₹140–₹185/sq ft</div>
            </div>
          </div>
          <span className="text-xs font-mono font-medium text-accent">84.5 pts</span>
        </div>
      </div>
    ),
  },
  {
    id: "providers",
    stepNumber: 2,
    icon: Building2,
    title: "Explore Vetted Service Providers",
    description:
      "Browse verified partners across GCC Setup Advisory, Commercial Real Estate, Employer of Record (EOR), and Corporate Legal counsel in top Indian technology hubs.",
    ruleHighlight:
      "Strictly alphabetical directory with zero pay-to-rank bias (ADR 005). Providers earn leads through matched eligibility, not ad spend.",
    linkText: "Browse Providers",
    linkHref: "/providers",
    mockup: (
      <div className="bg-background rounded border border-border p-3 space-y-2 text-xs">
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-surface rounded border border-border p-2 flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-accent-subtle text-accent text-[9px] font-medium flex items-center justify-center">
              AN
            </div>
            <div className="truncate">
              <div className="font-medium text-text text-[11px] truncate">ANSR</div>
              <div className="text-[9px] text-text-muted">Setup Advisor</div>
            </div>
          </div>
          <div className="bg-surface rounded border border-border p-2 flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-accent-subtle text-accent text-[9px] font-medium flex items-center justify-center">
              CB
            </div>
            <div className="truncate">
              <div className="font-medium text-text text-[11px] truncate">CBRE India</div>
              <div className="text-[9px] text-text-muted">Real Estate</div>
            </div>
          </div>
        </div>
        <div className="text-[10px] text-text-muted text-center pt-0.5">
          Filtered by category &amp; operating cities
        </div>
      </div>
    ),
  },
  {
    id: "request-intro",
    stepNumber: 3,
    icon: Users,
    title: "Request 3-Provider Introductions",
    description:
      "Submit your planned scope, candidate cities, and required services. Requests are routed to at most 3 eligible providers based on category matching and fair rotation.",
    ruleHighlight:
      "Buyer privacy protected: Your contact details remain hidden until a matched provider spends 1 credit to accept your intro offer.",
    linkText: "Request Intro",
    linkHref: "/request-intro",
    mockup: (
      <div className="bg-background rounded border border-border p-3 space-y-2 text-xs">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-medium text-text">Intro Request</span>
          <span className="px-1.5 py-0.5 rounded bg-accent-subtle text-accent text-[9px] font-medium">
            Max 3 Matched
          </span>
        </div>
        <div className="space-y-1.5 pt-1">
          <div className="p-1.5 bg-surface rounded border border-border text-[10px] flex items-center justify-between">
            <span className="text-text font-medium">Provider Slot 1</span>
            <span className="text-text-muted">Contact Protected</span>
          </div>
          <div className="p-1.5 bg-surface rounded border border-border text-[10px] flex items-center justify-between">
            <span className="text-text font-medium">Provider Slot 2</span>
            <span className="text-text-muted">Contact Protected</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "inbox",
    stepNumber: 4,
    icon: Coins,
    title: "Switch Personas & Manage Credits",
    description:
      "Use the persistent demo banner at the top of the screen to switch between 'Buyer' and 'Provider' roles. Review incoming lead offers and inspect the credit ledger.",
    ruleHighlight:
      "ADR 006 Demo Simulation: Accepting spends 1 credit to reveal buyer details. Invalid leads qualify for an instant 1-credit refund within 72 hours.",
    linkText: "View Provider Inbox",
    linkHref: "/inbox",
    mockup: (
      <div className="bg-background rounded border border-border p-3 space-y-2 text-xs">
        <div className="flex items-center justify-between bg-surface rounded border border-border p-2">
          <div className="flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-accent" />
            <span className="text-[11px] font-medium text-text">Wallet Balance</span>
          </div>
          <span className="font-mono text-xs font-medium text-text">5 credits</span>
        </div>
        <div className="text-[10px] text-text-muted flex items-center justify-between pt-0.5">
          <span>Accept offer: -1 credit</span>
          <span className="text-emerald-700 font-medium">Refund: +1 credit</span>
        </div>
      </div>
    ),
  },
];

export function VisualGuide() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const handleDismiss = useCallback(() => {
    setIsOpen(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("gcc_atlas_guide_dismissed", "true");
    }
  }, []);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleDismiss();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleDismiss();
      } else if (e.key === "ArrowRight") {
        if (currentStep < STEPS.length - 1) {
          setCurrentStep((prev) => prev + 1);
        }
      } else if (e.key === "ArrowLeft") {
        if (currentStep > 0) {
          setCurrentStep((prev) => prev - 1);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentStep, handleDismiss]);

  // Listen to open events
  useEffect(() => {
    const handleOpen = () => {
      setCurrentStep(0);
      setIsOpen(true);
    };

    window.addEventListener("open-visual-guide", handleOpen);
    return () => window.removeEventListener("open-visual-guide", handleOpen);
  }, []);

  // Auto-open for first-time interactive users (never during automated tests)
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (typeof window !== "undefined") {
      const isAutomation = Boolean(window.navigator.webdriver);
      const dismissed = localStorage.getItem("gcc_atlas_guide_dismissed");
      if (!isAutomation && !dismissed) {
        timer = setTimeout(() => setIsOpen(true), 400);
      }
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);

  if (!isOpen) return null;

  const step = STEPS[currentStep] ?? STEPS[0]!;
  const StepIcon = step.icon;
  const isLastStep = currentStep === STEPS.length - 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label="Quick Visual Guide"
      data-testid="visual-guide-dialog"
    >
      {/* Backdrop click dismiss */}
      <div
        className="absolute inset-0"
        onClick={handleDismiss}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div className="relative z-10 w-full max-w-lg bg-surface border border-border rounded-lg shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-surface">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-accent-subtle text-accent border border-border">
              Step {step.stepNumber} of {STEPS.length}
            </span>
            <span className="text-xs text-text-muted">Quick Visual Guide</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleDismiss}
              className="text-xs text-text-muted hover:text-text font-medium cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded-sm"
            >
              Skip guide
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Close guide"
              className="text-text-muted hover:text-text p-1 rounded-sm focus:outline-none focus-visible:ring-1 focus-visible:ring-accent"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* Step Miniature Mockup */}
          {step.mockup}

          {/* Title & Description */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-accent-subtle text-accent flex items-center justify-center shrink-0">
                <StepIcon className="w-3.5 h-3.5" />
              </div>
              <h2
                id="visual-guide-title"
                className="text-base font-medium text-text tracking-tight"
              >
                {step.title}
              </h2>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              {step.description}
            </p>
          </div>

          {/* Rule / Architecture Chip */}
          <div className="p-2.5 rounded bg-surface-raised border border-border flex items-start gap-2 text-[11px] text-text-muted leading-relaxed">
            <ShieldCheck className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
            <span>{step.ruleHighlight}</span>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-border bg-background/50">
          {/* Step Dots */}
          <div className="flex items-center gap-1.5" aria-hidden="true">
            {STEPS.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setCurrentStep(idx)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  idx === currentStep ? "bg-teal-primary" : "bg-border hover:bg-text-muted"
                }`}
                aria-label={`Jump to step ${idx + 1}`}
              />
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={handlePrev}
                className="px-3 py-1.5 rounded-sm border border-border bg-surface text-xs font-medium text-text hover:bg-background transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-accent inline-flex items-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Back</span>
              </button>
            )}

            <Link
              href={step.linkHref}
              onClick={handleDismiss}
              className="text-xs text-teal-primary font-medium hover:underline inline-flex items-center gap-1 px-2 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded-sm"
            >
              <span>{step.linkText}</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            <button
              type="button"
              onClick={handleNext}
              className="px-3 py-1.5 rounded-sm bg-teal-primary text-white text-xs font-medium hover:bg-teal-hover transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-accent inline-flex items-center gap-1"
            >
              <span>{isLastStep ? "Finish guide" : "Next step"}</span>
              {!isLastStep && <ArrowRight className="w-3 h-3" />}
              {isLastStep && <CheckCircle2 className="w-3 h-3" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
