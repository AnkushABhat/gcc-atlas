import Link from "next/link";
import { AlertCircle } from "lucide-react";

export const metadata = {
  title: "404 — Page Not Found | GCC Atlas",
  description: "The requested page does not exist or has been moved.",
};

export default function NotFound() {
  return (
    <div className="py-16 max-w-2xl mx-auto text-center space-y-6">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-surface-raised border border-border text-amber-600 mb-2">
        <AlertCircle className="w-6 h-6" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-text">
          Page Not Found
        </h1>
        <p className="text-sm text-text-muted max-w-md mx-auto leading-relaxed">
          The requested page could not be found. Check the URL or return to one of our core tools.
        </p>
      </div>

      <div className="pt-4 flex items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center justify-center px-4 py-2 rounded-sm border border-border bg-surface hover:bg-surface-raised text-text text-xs font-medium transition-colors duration-150 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent"
        >
          Return Home
        </Link>
        <Link
          href="/planner"
          className="inline-flex items-center justify-center px-4 py-2 rounded-sm bg-teal-primary hover:bg-teal-hover text-white text-xs font-medium transition-colors duration-150 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent"
        >
          Launch Setup Planner
        </Link>
      </div>
    </div>
  );
}
