import React from "react";

export default function ProvidersLoading() {
  return (
    <div className="space-y-6 animate-pulse" role="status" aria-label="Loading Service Providers">
      <div>
        <div className="h-7 w-56 bg-surface-raised rounded-sm" />
        <div className="h-4 w-96 max-w-full bg-surface-raised rounded-sm mt-1.5" />
      </div>

      <div className="h-14 bg-surface rounded-lg border border-border" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-48 bg-surface rounded-lg border border-border" />
        <div className="h-48 bg-surface rounded-lg border border-border" />
        <div className="h-48 bg-surface rounded-lg border border-border" />
        <div className="h-48 bg-surface rounded-lg border border-border" />
      </div>
    </div>
  );
}
