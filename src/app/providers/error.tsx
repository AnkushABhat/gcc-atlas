"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function ProvidersError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Providers directory error:", error);
  }, [error]);

  return (
    <div
      role="alert"
      className="max-w-xl mx-auto py-12 px-6 rounded-lg border border-border bg-surface text-center space-y-4"
    >
      <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-error-subtle border border-error/20 text-error">
        <AlertCircle className="w-5 h-5" />
      </div>

      <div className="space-y-1">
        <h1 className="text-base font-medium tracking-tight text-text">
          Failed to load provider directory
        </h1>
        <p className="text-xs text-text-muted leading-relaxed">
          The service provider directory could not be retrieved from the database.
        </p>
      </div>

      <div className="pt-2 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center px-4 py-2 rounded-sm bg-teal-primary text-white text-xs font-medium hover:bg-teal-hover transition-colors duration-150 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent cursor-pointer"
        >
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex items-center px-4 py-2 rounded-sm border border-border text-text text-xs font-medium hover:bg-surface-raised transition-colors duration-150 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent"
        >
          Return home
        </Link>
      </div>
    </div>
  );
}
