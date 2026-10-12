"use client";

import React, { useState, useId } from "react";
import { ChevronDown, FileText } from "lucide-react";

export interface SmoothAccordionProps {
  title: React.ReactNode;
  children: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  defaultExpanded?: boolean;
  expanded?: boolean;
  onToggle?: (expanded: boolean) => void;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  id?: string;
  "data-testid"?: string;
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
  headerClassName = "",
  contentClassName = "",
  id,
  "data-testid": testId,
}: SmoothAccordionProps) {
  const generatedId = useId();
  const baseId = id || `accordion-${generatedId.replace(/:/g, "")}`;
  const headerId = `${baseId}-header`;
  const contentId = `${baseId}-content`;

  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const isExpanded =
    controlledExpanded !== undefined ? controlledExpanded : internalExpanded;

  const handleToggle = () => {
    const next = !isExpanded;
    if (controlledExpanded === undefined) {
      setInternalExpanded(next);
    }
    onToggle?.(next);
  };

  return (
    <div
      className={`rounded-xl border border-border bg-surface overflow-hidden ${className}`}
      data-testid={testId}
    >
      <button
        id={headerId}
        type="button"
        onClick={handleToggle}
        aria-expanded={isExpanded}
        aria-controls={contentId}
        className={`w-full flex items-center justify-between p-3.5 text-left text-xs font-medium text-text hover:text-accent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 select-none ${headerClassName}`}
      >
        <div className="flex items-center gap-2 min-w-0 pr-2">
          {icon || <FileText className="w-4 h-4 text-accent shrink-0" aria-hidden="true" />}
          <span className="truncate">{title}</span>
          {badge}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-text-muted transition-transform duration-250 ease-out shrink-0 ${
            isExpanded ? "rotate-180 text-accent" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      <div
        id={contentId}
        role="region"
        aria-labelledby={headerId}
        data-expanded={isExpanded}
        className="accordion-grid"
      >
        <div className="accordion-inner">
          <div className={`p-3.5 pt-1.5 border-t border-border/60 ${contentClassName}`}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
