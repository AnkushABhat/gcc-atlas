import React from "react";

export default function PlannerLoading() {
  return (
    <div className="space-y-8 animate-pulse" role="status" aria-label="Loading Setup Planner">
      <div>
        <div className="h-8 w-64 bg-surface-raised rounded-sm" />
        <div className="h-4 w-96 max-w-full bg-surface-raised rounded-sm mt-2" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar skeleton */}
        <div className="lg:col-span-4 bg-surface border border-border rounded-md p-5 space-y-6">
          <div className="h-5 w-40 bg-surface-raised rounded-sm" />
          <div className="h-10 bg-surface-raised rounded-sm" />
          <div className="h-16 bg-surface-raised rounded-sm" />
          <div className="h-32 bg-surface-raised rounded-sm" />
        </div>

        {/* Results skeleton */}
        <div className="lg:col-span-8 space-y-4">
          <div className="h-6 w-48 bg-surface-raised rounded-sm" />
          <div className="h-36 bg-surface border border-border rounded-md" />
          <div className="h-36 bg-surface border border-border rounded-md" />
          <div className="h-36 bg-surface border border-border rounded-md" />
        </div>
      </div>
    </div>
  );
}
