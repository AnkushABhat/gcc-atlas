"use client";

import React, { useState } from "react";
import Image from "next/image";

interface ProviderLogoProps {
  providerSlug: string;
  providerName: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_MAP = {
  sm: {
    container: "w-7 h-7 rounded-sm",
    img: 18,
    font: "text-[10px]",
  },
  md: {
    container: "w-10 h-10 rounded-md",
    img: 26,
    font: "text-xs",
  },
  lg: {
    container: "w-14 h-14 rounded-lg",
    img: 38,
    font: "text-sm",
  },
};

export function ProviderLogo({
  providerSlug,
  providerName,
  size = "md",
  className = "",
}: ProviderLogoProps) {
  const [hasError, setHasError] = useState(false);
  const sizeConfig = SIZE_MAP[size];

  // Compute initials fallback (e.g. "ANSR" -> "AN", "JLL India" -> "JL")
  const initials = providerName
    .split(/\s+/)
    .map((word) => word[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const logoSrc = `/logos/providers/${providerSlug}.png`;

  return (
    <div
      className={`relative flex items-center justify-center shrink-0 bg-surface border border-border shadow-xs overflow-hidden ${sizeConfig.container} ${className}`}
      title={providerName}
    >
      {!hasError ? (
        <Image
          src={logoSrc}
          alt={`${providerName} logo`}
          width={sizeConfig.img}
          height={sizeConfig.img}
          className="object-contain p-0.5"
          onError={() => setHasError(true)}
          unoptimized
        />
      ) : (
        <div
          className={`w-full h-full flex items-center justify-center font-medium text-accent bg-accent-subtle ${sizeConfig.font}`}
          aria-label={providerName}
        >
          {initials}
        </div>
      )}
    </div>
  );
}
