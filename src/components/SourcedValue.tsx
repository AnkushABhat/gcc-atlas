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

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      <div className="flex flex-col gap-0.5">
        {label && <span className="text-xs text-text-muted">{label}</span>}
        <button
          type="button"
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-2 group text-left cursor-pointer rounded-sm focus:outline-none focus:ring-1 focus:ring-accent"
          title="Click to view data source and methodology"
        >
          <span className="text-sm font-medium text-text tabular-nums font-mono group-hover:text-accent transition-colors duration-150">
            {valueText}
          </span>
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded-sm border font-sans font-medium transition-colors duration-150 ${
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
          className="absolute z-50 bottom-full mb-2 left-0 w-72 sm:w-80 p-3.5 bg-surface rounded-md border border-border shadow-lg text-xs space-y-2 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="flex items-center justify-between border-b border-border pb-2">
            <span className="font-medium text-text flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-accent" />
              Source Attribution
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-text-muted hover:text-text rounded-sm p-0.5 focus:outline-none focus:ring-1 focus:ring-accent"
              aria-label="Close popover"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1.5">
            <div>
              <span className="text-text-muted block text-[11px]">Primary Source:</span>
              <span className="font-medium text-text">{fact.sourceName}</span>
            </div>

            <div>
              <span className="text-text-muted block text-[11px]">Verified Source URL:</span>
              <a
                href={fact.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline flex items-center gap-1 break-all"
              >
                <span>{fact.sourceUrl}</span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-1">
              <div>
                <span className="text-text-muted">As-of Date: </span>
                <span className="font-mono text-text">{fact.asOf}</span>
              </div>
              <div>
                <span className="text-text-muted">Confidence: </span>
                <span className="capitalize text-text font-medium">{fact.confidence}</span>
              </div>
            </div>

            {fact.note && (
              <div className="pt-1.5 border-t border-border">
                <span className="text-text-muted block text-[11px]">Methodology / Note:</span>
                <p className="text-text text-[11px] leading-relaxed mt-0.5">{fact.note}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
