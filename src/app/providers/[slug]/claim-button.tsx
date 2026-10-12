"use client";

import React, { useTransition, useState } from "react";
import { claimProviderAction, demoSwitchAndClaimAction } from "../actions";
import { switchDemoRoleAction } from "@/app/actions/auth";

interface ClaimButtonProps {
  slug: string;
  isClaimed: boolean;
  isOwner: boolean;
  currentRole: string;
  currentProviderSlug?: string;
}

export function ClaimButton({
  slug,
  isClaimed,
  isOwner,
  currentRole,
  currentProviderSlug,
}: ClaimButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSwitchToProvider = () => {
    setErrorMessage(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.append("role", "provider");
      formData.append("providerSlug", slug);
      await switchDemoRoleAction(formData);
    });
  };

  if (isClaimed) {
    return (
      <div className="flex items-center gap-2">
        <span
          data-testid="claimed-badge"
          className="px-2.5 py-1 rounded text-xs font-medium bg-accent-subtle text-accent border border-border"
        >
          Claimed
        </span>
        {isOwner ? (
          <span
            data-testid="owner-badge"
            className="px-2.5 py-1 rounded text-xs font-medium bg-success-subtle text-success border border-success/30"
          >
            Owner
          </span>
        ) : (
          <button
            type="button"
            onClick={handleSwitchToProvider}
            disabled={isPending}
            className="text-[11px] text-teal-primary hover:underline font-medium cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded-sm"
          >
            {isPending ? "Switching..." : "Switch to this provider (Demo)"}
          </button>
        )}
      </div>
    );
  }

  const isCurrentProvider =
    currentRole === "provider" && currentProviderSlug === slug;

  const handleClaim = () => {
    setErrorMessage(null);
    startTransition(async () => {
      let result;
      if (isCurrentProvider) {
        const formData = new FormData();
        formData.append("slug", slug);
        result = await claimProviderAction(formData);
      } else {
        result = await demoSwitchAndClaimAction(slug);
      }

      if (!result.success) {
        setErrorMessage(result.error);
      }
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleClaim}
          disabled={isPending}
          className="inline-flex items-center px-3.5 py-1.5 rounded bg-teal-primary text-white text-xs font-medium hover:bg-teal-hover transition-colors duration-150 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent disabled:opacity-50 cursor-pointer"
        >
          {isPending
            ? "Claiming..."
            : isCurrentProvider
            ? "Claim profile"
            : "Claim profile (Demo)"}
        </button>
        <span className="text-[11px] text-text-muted">
          Demo mode: takes ownership of this profile
        </span>
      </div>
      {errorMessage && (
        <p className="text-xs text-red-600 font-medium">{errorMessage}</p>
      )}
    </div>
  );
}
