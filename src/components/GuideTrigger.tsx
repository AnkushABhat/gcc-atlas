"use client";

import React from "react";
import { HelpCircle } from "lucide-react";
import { openVisualGuide } from "./VisualGuide";

interface GuideTriggerProps {
  className?: string;
}

export function GuideTrigger({ className = "" }: GuideTriggerProps) {
  return (
    <button
      type="button"
      onClick={() => openVisualGuide()}
      aria-label="Open visual guide"
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-normal text-text-muted hover:text-text hover:bg-background border border-border/80 transition-colors duration-150 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent cursor-pointer ${className}`}
    >
      <HelpCircle className="w-3.5 h-3.5 text-accent" />
      <span>Guide</span>
    </button>
  );
}
