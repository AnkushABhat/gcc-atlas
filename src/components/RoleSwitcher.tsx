"use client";

import React, { useTransition } from "react";
import { switchDemoRoleAction } from "@/app/actions/auth";
import type { Session } from "@/modules/auth";

export interface RoleSwitcherProps {
  currentSession: Session;
  availableProviders: Array<{ slug: string; name: string }>;
}

export function RoleSwitcher({
  currentSession,
  availableProviders,
}: RoleSwitcherProps) {
  const [isPending, startTransition] = useTransition();

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    startTransition(async () => {
      const formData = new FormData();
      if (val === "buyer" || val === "admin") {
        formData.append("role", val);
      } else if (val.startsWith("provider:")) {
        const slug = val.replace("provider:", "");
        formData.append("role", "provider");
        formData.append("providerSlug", slug);
      }
      await switchDemoRoleAction(formData);
    });
  };

  const selectedValue =
    currentSession.role === "provider"
      ? `provider:${currentSession.providerSlug}`
      : currentSession.role;

  return (
    <div className="flex items-center gap-2 text-xs">
      <label htmlFor="demo-role-select" className="text-text-muted font-medium">
        Demo mode:
      </label>
      <div className="relative">
        <select
          id="demo-role-select"
          value={selectedValue}
          onChange={handleRoleChange}
          disabled={isPending}
          className="bg-surface border border-border rounded px-2 py-1 text-xs text-text focus:outline-none focus:ring-1 focus:ring-teal-primary cursor-pointer disabled:opacity-50"
          aria-label="Demo role switcher"
        >
          <option value="buyer">Buyer (Default)</option>
          <optgroup label="Providers">
            {availableProviders.map((p) => (
              <option key={p.slug} value={`provider:${p.slug}`}>
                Provider: {p.name}
              </option>
            ))}
          </optgroup>
          <option value="admin">Admin</option>
        </select>
      </div>
      {isPending && (
        <span className="text-[11px] text-text-muted animate-pulse">
          switching...
        </span>
      )}
    </div>
  );
}
