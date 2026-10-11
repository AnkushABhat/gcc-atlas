import React from "react";
import { FactorScore, Factor } from "../modules/planner/types";

export interface FactorBarProps {
  factors: FactorScore[];
  score: number;
  className?: string;
}

const FACTOR_LABELS: Record<Factor, string> = {
  talent: "Talent",
  cost: "Cost Efficiency",
  ecosystem: "Ecosystem Density",
  incentives: "Policy Incentives",
};

// Subtle teal and neutral palette matching design tokens (neutral warm grays + accent deep teal)
const FACTOR_STYLES: Record<Factor, { bg: string; text: string; dot: string }> = {
  talent: {
    bg: "bg-[#005f60]", // primary teal
    text: "text-[#005f60]",
    dot: "bg-[#005f60]",
  },
  cost: {
    bg: "bg-[#1f7a7b]", // lighter teal
    text: "text-[#1f7a7b]",
    dot: "bg-[#1f7a7b]",
  },
  ecosystem: {
    bg: "bg-[#4a6b6c]", // slate teal
    text: "text-[#4a6b6c]",
    dot: "bg-[#4a6b6c]",
  },
  incentives: {
    bg: "bg-[#8a9b9c]", // muted slate
    text: "text-[#6b7b7c]",
    dot: "bg-[#8a9b9c]",
  },
};

export function FactorBar({ factors, score, className = "" }: FactorBarProps) {
  // Total composite score is out of 100
  return (
    <div className={`space-y-2 ${className}`}>
      {/* Segmented bar */}
      <div
        className="w-full h-2.5 bg-surface-raised rounded-sm overflow-hidden flex border border-border"
        role="progressbar"
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Composite score: ${score} out of 100`}
      >
        {factors.map((f) => {
          if (f.contribution <= 0) return null;
          const style = FACTOR_STYLES[f.factor] ?? FACTOR_STYLES.talent;
          return (
            <div
              key={f.factor}
              style={{ width: `${f.contribution}%` }}
              className={`h-full ${style.bg} transition-all duration-150`}
              title={`${FACTOR_LABELS[f.factor]}: +${f.contribution.toFixed(1)} pts (weight ${(f.weight * 100).toFixed(0)}%)`}
            />
          );
        })}
      </div>

      {/* Factor contribution details */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-text-muted">
        {factors.map((f) => {
          const style = FACTOR_STYLES[f.factor] ?? FACTOR_STYLES.talent;
          return (
            <div key={f.factor} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${style.dot}`} />
              <span className="font-medium text-text">{FACTOR_LABELS[f.factor]}:</span>
              <span className="tabular-nums font-mono text-text">+{f.contribution.toFixed(1)}</span>
              <span className="text-text-muted text-[10px]">({(f.weight * 100).toFixed(0)}% wt)</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
