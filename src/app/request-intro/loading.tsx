import React from "react";

export default function RequestIntroLoading() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-pulse" role="status" aria-label="Loading Request Introduction">
      <div>
        <div className="h-7 w-52 bg-surface-raised rounded-sm" />
        <div className="h-4 w-96 max-w-full bg-surface-raised rounded-sm mt-1.5" />
      </div>

      <div className="h-10 bg-surface-raised rounded-lg border border-border" />

      <div className="bg-surface rounded-lg border border-border p-6 sm:p-8 space-y-6">
        <div className="h-5 w-32 bg-surface-raised rounded-sm" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="h-10 bg-surface-raised rounded-sm" />
          <div className="h-10 bg-surface-raised rounded-sm" />
        </div>
        <div className="h-10 bg-surface-raised rounded-sm" />
        <div className="h-10 bg-surface-raised rounded-sm" />
      </div>
    </div>
  );
}
