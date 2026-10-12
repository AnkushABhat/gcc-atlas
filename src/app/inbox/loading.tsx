import React from "react";

export default function InboxLoading() {
  return (
    <div className="space-y-8 animate-pulse" role="status" aria-label="Loading Provider Inbox">
      <div className="h-10 bg-surface-raised rounded-lg border border-border" />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="h-7 w-44 bg-surface-raised rounded-sm" />
          <div className="h-4 w-64 bg-surface-raised rounded-sm mt-1" />
        </div>
        <div className="h-16 w-48 bg-surface rounded-lg border border-border" />
      </div>

      <div className="space-y-4">
        <div className="h-5 w-36 bg-surface-raised rounded-sm" />
        <div className="h-40 bg-surface rounded-lg border border-border" />
        <div className="h-40 bg-surface rounded-lg border border-border" />
      </div>
    </div>
  );
}
