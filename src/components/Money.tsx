import React from "react";

export interface MoneyProps {
  amount?: number;
  min?: number;
  max?: number;
  perMonth?: boolean;
  className?: string;
}

export function formatInr(val: number): string {
  if (val === 0) return "₹0";
  const abs = Math.abs(val);
  const sign = val < 0 ? "-" : "";

  if (abs >= 10000000) {
    const cr = abs / 10000000;
    const formatted = cr >= 10 ? cr.toFixed(1) : cr.toFixed(2);
    return `${sign}₹${formatted.replace(/\.00?$|\.0$/, "")} crore`;
  }
  if (abs >= 100000) {
    const lakh = abs / 100000;
    const formatted = lakh >= 10 ? lakh.toFixed(1) : lakh.toFixed(2);
    return `${sign}₹${formatted.replace(/\.00?$|\.0$/, "")} lakh`;
  }
  return `${sign}₹${abs.toLocaleString("en-IN")}`;
}

export function Money({ amount, min, max, perMonth, className = "" }: MoneyProps) {
  let display = "";

  if (min !== undefined && max !== undefined) {
    if (min === max) {
      display = formatInr(min);
    } else {
      display = `${formatInr(min)} – ${formatInr(max)}`;
    }
  } else if (amount !== undefined) {
    display = formatInr(amount);
  } else {
    display = "₹0";
  }

  return (
    <span className={`tabular-nums font-mono text-text ${className}`}>
      {display}
      {perMonth && <span className="text-text-muted text-xs font-normal"> / mo</span>}
    </span>
  );
}
