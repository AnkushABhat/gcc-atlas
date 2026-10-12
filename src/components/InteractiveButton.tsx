"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";

export interface InteractiveButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
  icon?: LucideIcon | React.ComponentType<{ className?: string }>;
  variant?: "primary" | "secondary" | "subtle";
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  showArrow?: boolean;
  "data-testid"?: string;
  id?: string;
  "aria-label"?: string;
  target?: string;
  rel?: string;
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
  showArrow = true,
  "data-testid": testId,
  id,
  "aria-label": ariaLabel,
  target,
  rel,
}: InteractiveButtonProps) {
  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs rounded-lg gap-1.5",
    md: "px-4 py-2 text-sm rounded-xl gap-2",
    lg: "px-5 py-2.5 text-base rounded-2xl gap-2.5",
  }[size];

  const variantClasses = {
    primary:
      "gradient-primary-btn text-white shadow-subtle hover:shadow-elevated hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none disabled:hover:translate-y-0",
    secondary:
      "bg-surface hover:bg-surface-raised text-text border border-border shadow-subtle hover:border-accent/40 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none disabled:hover:translate-y-0",
    subtle:
      "bg-accent-subtle text-accent hover:bg-accent-subtle/80 border border-border/80 disabled:opacity-50 disabled:pointer-events-none",
  }[variant];

  const commonClasses = `group inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 select-none ${sizeClasses} ${variantClasses} ${className}`;

  const iconElement = Icon ? (
    <Icon className="w-4 h-4 shrink-0 transition-transform duration-200" aria-hidden="true" />
  ) : null;

  const arrowElement = showArrow ? (
    <ArrowRight
      className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:translate-x-1"
      aria-hidden="true"
    />
  ) : null;

  if (href) {
    const isExternal = href.startsWith("http://") || href.startsWith("https://");
    const externalRel = isExternal ? rel || "noopener noreferrer" : rel;

    if (isExternal) {
      return (
        <a
          href={href}
          onClick={onClick}
          className={commonClasses}
          data-testid={testId}
          id={id}
          aria-label={ariaLabel}
          target={target || "_blank"}
          rel={externalRel}
        >
          {iconElement}
          <span>{children}</span>
          {arrowElement}
        </a>
      );
    }

    return (
      <Link
        href={href}
        onClick={onClick}
        className={commonClasses}
        data-testid={testId}
        id={id}
        aria-label={ariaLabel}
        target={target}
        rel={rel}
      >
        {iconElement}
        <span>{children}</span>
        {arrowElement}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={commonClasses}
      data-testid={testId}
      id={id}
      aria-label={ariaLabel}
    >
      {iconElement}
      <span>{children}</span>
      {arrowElement}
    </button>
  );
}
