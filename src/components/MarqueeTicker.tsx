"use client";

import React, { useState } from "react";
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

export interface MarqueeTickerProps {
  items?: MarqueeItem[];
  label?: string;
  speedSeconds?: number;
  className?: string;
}

export const DEFAULT_BENCHMARK_GCC_ITEMS: MarqueeItem[] = [
  {
    id: "gcc-google",
    name: "Google",
    city: "Bengaluru",
    category: "Tech & AI",
  },
  {
    id: "gcc-microsoft",
    name: "Microsoft IDC",
    city: "Hyderabad",
    category: "Cloud & Engineering",
  },
  {
    id: "gcc-goldman",
    name: "Goldman Sachs",
    city: "Bengaluru",
    category: "Global Markets & Tech",
  },
  {
    id: "provider-cbre",
    name: "CBRE India",
    city: "National",
    category: "Real Estate & Transactions",
    logoSrc: "/logos/providers/cbre-india.png",
    href: "/providers/cbre-india",
  },
  {
    id: "gcc-amazon",
    name: "Amazon Development Centre",
    city: "Hyderabad",
    category: "Cloud & Retail Tech",
  },
  {
    id: "provider-ansr",
    name: "ANSR",
    city: "Bengaluru",
    category: "Setup Advisor",
    logoSrc: "/logos/providers/ansr-global.png",
    href: "/providers/ansr-global",
  },
  {
    id: "gcc-walmart",
    name: "Walmart Global Tech",
    city: "Bengaluru",
    category: "Enterprise Tech",
  },
  {
    id: "provider-trilegal",
    name: "Trilegal",
    city: "National",
    category: "Legal & Regulatory",
    logoSrc: "/logos/providers/trilegal.png",
    href: "/providers/trilegal",
  },
  {
    id: "gcc-sap",
    name: "SAP Labs India",
    city: "Bengaluru",
    category: "Enterprise Software",
  },
  {
    id: "provider-jll",
    name: "JLL India",
    city: "National",
    category: "Corporate Real Estate",
    logoSrc: "/logos/providers/jll-india.png",
    href: "/providers/jll-india",
  },
  {
    id: "gcc-novartis",
    name: "Novartis Healthcare",
    city: "Hyderabad",
    category: "Data Science & Clinical",
  },
  {
    id: "provider-cam",
    name: "Cyril Amarchand Mangaldas",
    city: "National",
    category: "Corporate Legal",
    logoSrc: "/logos/providers/cyril-amarchand-mangaldas.png",
    href: "/providers/cyril-amarchand-mangaldas",
  },
  {
    id: "gcc-barclays",
    name: "Barclays GSC",
    city: "Pune",
    category: "Financial Services",
  },
  {
    id: "provider-deel",
    name: "Deel India",
    city: "Remote",
    category: "EOR & Payroll",
    logoSrc: "/logos/providers/deel-india.png",
    href: "/providers/deel-india",
  },
];

function TickerItemCard({ item }: { item: MarqueeItem }) {
  const [imgError, setImgError] = useState(false);

  const cardContent = (
    <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-surface border border-border shadow-subtle hover:border-accent/40 transition-colors whitespace-nowrap select-none">
      {item.logoSrc && !imgError ? (
        <div className="w-5 h-5 relative shrink-0">
          <Image
            src={item.logoSrc}
            alt={`${item.name} logo`}
            width={20}
            height={20}
            className="object-contain"
            unoptimized
            onError={() => setImgError(true)}
          />
        </div>
      ) : (
        <Building2 className="w-4 h-4 text-accent shrink-0" aria-hidden="true" />
      )}
      <span className="text-xs font-medium text-text">{item.name}</span>
      {item.city && (
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-raised text-text-muted capitalize">
          {item.city}
        </span>
      )}
    </div>
  );

  if (item.href) {
    return (
      <Link
        href={item.href}
        className="focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 rounded-xl block"
        tabIndex={0}
      >
        {cardContent}
      </Link>
    );
  }

  return <div>{cardContent}</div>;
}

function InactiveTickerItemCard({ item }: { item: MarqueeItem }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-surface border border-border shadow-subtle whitespace-nowrap select-none">
      {item.logoSrc && !imgError ? (
        <div className="w-5 h-5 relative shrink-0">
          <Image
            src={item.logoSrc}
            alt=""
            width={20}
            height={20}
            className="object-contain"
            unoptimized
            onError={() => setImgError(true)}
          />
        </div>
      ) : (
        <Building2 className="w-4 h-4 text-accent shrink-0" aria-hidden="true" />
      )}
      <span className="text-xs font-medium text-text">{item.name}</span>
      {item.city && (
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-raised text-text-muted capitalize">
          {item.city}
        </span>
      )}
    </div>
  );
}

export function MarqueeTicker({
  items,
  label = "Operating GCC Benchmarks & Partner Ecosystem",
  speedSeconds = 35,
  className = "",
}: MarqueeTickerProps) {
  const sourceItems = items && items.length > 0 ? items : DEFAULT_BENCHMARK_GCC_ITEMS;

  return (
    <div
      className={`relative overflow-hidden w-full group ${className}`}
      role="region"
      aria-label={label}
    >
      {label && (
        <div className="flex items-center justify-between mb-3 px-1 text-xs text-text-muted">
          <div className="flex items-center gap-1.5 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
            <span>{label}</span>
          </div>
          <span className="text-[11px] text-text-muted">100% Verified Centers</span>
        </div>
      )}

      {/* Left and Right Gradient Fade Masks */}
      <div
        className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 sm:w-28 z-10 bg-gradient-to-r from-background to-transparent"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-28 z-10 bg-gradient-to-l from-background to-transparent"
        aria-hidden="true"
      />

      {/* Scrolling Track */}
      <div
        className="flex gap-4 w-max animate-marquee hover:[animation-play-state:paused] focus-within:[animation-play-state:paused] will-change-transform py-1"
        style={{ "--marquee-duration": `${speedSeconds}s` } as React.CSSProperties}
      >
        {/* Primary Track (interactive, read by screen readers) */}
        <div className="flex gap-4 shrink-0">
          {sourceItems.map((item, idx) => (
            <TickerItemCard key={`pri-${item.id}-${idx}`} item={item} />
          ))}
        </div>

        {/* Cloned Track (visual loop only, aria-hidden for screen readers) */}
        <div className="flex gap-4 shrink-0" aria-hidden="true">
          {sourceItems.map((item, idx) => (
            <InactiveTickerItemCard key={`clone-${item.id}-${idx}`} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
