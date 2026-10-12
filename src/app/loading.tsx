import React from "react";

export default function Loading() {
  return (
    <div className="space-y-6 py-6 animate-pulse" role="status" aria-label="Loading page">
      <div className="h-6 w-48 bg-surface-raised rounded-sm" />
      <div className="h-4 w-96 bg-surface-raised rounded-sm" />
      <div className="space-y-3 pt-4">
        <div className="h-20 bg-surface rounded-md border border-border" />
        <div className="h-20 bg-surface rounded-md border border-border" />
      </div>
    </div>
  );
}
