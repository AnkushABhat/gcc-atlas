"use client";

import React from "react";

export interface FloatingHighlightCardProps {
  title: string;
  value: React.ReactNode;
  subtitle?: string;
  badge?: string;
  icon?: React.ReactNode;
  className?: string;
  animate?: boolean;
  "data-testid"?: string;
}

export function FloatingHighlightCard({
  title,
  value,
  subtitle,
  badge,
  icon,
  className = "",
  animate = false,
  "data-testid": testId,
}: FloatingHighlightCardProps) {
  return (
    <div
      className={`relative rounded-2xl bg-surface border border-border p-5 shadow-elevated hover:shadow-float transition-all duration-200 group select-none ${
        animate ? "animate-float-slow hover:[animation-play-state:paused]" : ""
      } ${className}`}
      data-testid={testId}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-medium text-text-muted">{title}</span>
        {badge && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-accent-subtle text-accent border border-accent/20 transform -rotate-2 group-hover:rotate-0 transition-transform duration-200 shadow-xs">
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
        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-text-muted">
          {icon && <span className="shrink-0">{icon}</span>}
          <span>{subtitle}</span>
        </div>
      )}
    </div>
  );
}
