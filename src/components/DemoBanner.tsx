import React from "react";
import { RoleSwitcher } from "./RoleSwitcher";
import type { Session } from "@/modules/auth";

export interface DemoBannerProps {
  currentSession: Session;
  availableProviders: Array<{ slug: string; name: string }>;
}

export function DemoBanner({
  currentSession,
  availableProviders,
}: DemoBannerProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="w-full bg-accent-subtle border-b border-border px-4 py-2 text-xs text-accent font-medium flex items-center justify-between"
    >
      <span>GCC Atlas Prototype — nothing is sent to anyone</span>
      <RoleSwitcher
        currentSession={currentSession}
        availableProviders={availableProviders}
      />
    </div>
  );
}
