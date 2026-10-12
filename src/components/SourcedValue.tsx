"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExternalLink, X, Info } from "lucide-react";
import { formatInr } from "./Money";

export interface SourcedFact {
  valueMin: number;
  valueMax: number;
  unit: string;
  sourceName: string;
  sourceUrl: string;
  asOf: string;
  confidence: "reported" | "derived" | "estimate" | string;
  note?: string | null;
  pinpoint?: string | null;
}

export interface SourcedValueProps {
  fact: SourcedFact;
  label?: string;
  className?: string;
}

export function SourcedValue({ fact, label, className = "" }: SourcedValueProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close on Escape or click outside
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }

    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Format value based on unit
  let valueText = "";
  if (fact.unit.includes("INR") || fact.unit.includes("rent")) {
    if (fact.valueMin === fact.valueMax) {
      valueText = formatInr(fact.valueMin);
    } else {
      valueText = `${formatInr(fact.valueMin)} – ${formatInr(fact.valueMax)}`;
    }
    valueText += " / sq ft / mo";
  } else if (fact.unit.includes("people") || fact.unit.includes("talent")) {
    if (fact.valueMin >= 100000) {
      const lakh = fact.valueMin / 100000;
      valueText = `${lakh >= 10 ? lakh.toFixed(1) : lakh.toFixed(2).replace(/\.0$/, "")} lakh people`;
    } else {
      valueText = `${fact.valueMin.toLocaleString("en-IN")} people`;
    }
  } else {
    valueText =
      fact.valueMin === fact.valueMax
        ? `${fact.valueMin} ${fact.unit}`
        : `${fact.valueMin} – ${fact.valueMax} ${fact.unit}`;
  }

  const confidenceLabels: Record<string, string> = {
    reported: "Reported",
    derived: "Derived",
    estimate: "Estimate",
  };

  const confidenceLabel = confidenceLabels[fact.confidence.toLowerCase()] ?? "Reported";
  const isDirectDoc = fact.sourceUrl.endsWith(".pdf") || fact.sourceUrl.includes("/pdf") || fact.sourceUrl.includes("/doc/");

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      <div className="flex flex-col gap-1">
        {label && <span className="text-xs font-medium text-text-muted">{label}</span>}
        <button
          type="button"
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-2 group text-left cursor-pointer rounded-sm focus:outline-none focus:ring-1 focus:ring-accent"
          title="Click to view data source, exact document location, and methodology"
        >
          <span className="text-[15px] font-medium text-text tabular-nums font-mono group-hover:text-accent transition-colors duration-150">
            {valueText}
          </span>
          <span
            className={`text-xs px-2 py-0.5 rounded-sm border font-sans font-medium transition-colors duration-150 ${
              fact.confidence === "estimate"
                ? "bg-amber-50 text-amber-800 border-amber-200"
                : fact.confidence === "derived"
                ? "bg-sky-50 text-sky-800 border-sky-200"
                : "bg-surface-raised text-text-muted border-border group-hover:border-border-strong"
            }`}
          >
            {confidenceLabel}
          </span>
        </button>
      </div>

      {isOpen && (
        <div
          ref={popoverRef}
          role="dialog"
          aria-modal="false"
          aria-label="Data provenance details"
          className="absolute z-50 bottom-full mb-2 left-0 w-80 sm:w-96 p-4 bg-surface rounded-md border border-border shadow-lg text-xs space-y-3 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="flex items-center justify-between border-b border-border pb-2.5">
            <span className="font-medium text-text flex items-center gap-1.5 text-sm">
              <Info className="w-4 h-4 text-accent" />
              Source Attribution & Provenance
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-text-muted hover:text-text rounded-sm p-1 focus:outline-none focus:ring-1 focus:ring-accent"
              aria-label="Close popover"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2.5 text-xs">
            <div>
              <span className="text-text-muted block text-xs">Primary Research Source:</span>
              <span className="font-medium text-text text-sm">{fact.sourceName}</span>
            </div>

            {fact.pinpoint && (
              <div className="bg-surface-raised/70 p-2.5 rounded-sm border border-border">
                <span className="text-teal-primary block text-xs font-medium">
                  Exact In-Document Pinpoint:
                </span>
                <span className="text-text font-medium text-xs mt-0.5 block">
                  {fact.pinpoint}
                </span>
              </div>
            )}

            <div>
              <span className="text-text-muted block text-xs">Direct Document / Publication:</span>
              <a
                href={fact.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline flex items-center gap-1.5 break-all mt-0.5 font-medium"
              >
                <span>{fact.sourceUrl}</span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              </a>
              {isDirectDoc && (
                <span className="text-[11px] text-text-muted mt-0.5 block">
                  (Direct official document / PDF URL)
                </span>
              )}
            </div>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-border/60">
              <div>
                <span className="text-text-muted">As-of Date: </span>
                <span className="font-mono text-text font-medium">{fact.asOf}</span>
              </div>
              <div>
                <span className="text-text-muted">Confidence: </span>
                <span className="capitalize text-text font-medium">{fact.confidence}</span>
              </div>
            </div>

            {fact.note && (
              <div className="pt-2 border-t border-border">
                <span className="text-text-muted block text-xs">Methodology / Note:</span>
                <p className="text-text text-xs leading-relaxed mt-0.5">{fact.note}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
