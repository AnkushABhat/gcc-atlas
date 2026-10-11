import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "GCC Atlas — Single source of truth for Indian GCCs",
  description: "Interactive planner and vetted directory for setting up Global Capability Centres in India.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-background text-text">
        {/* Prototype persistent banner per ADR 006 */}
        <div
          role="status"
          aria-live="polite"
          className="w-full bg-[#f0f4f4] border-b border-[#d8e4e4] px-4 py-2 text-xs text-[#004d4e] font-medium flex items-center justify-between"
        >
          <span>GCC Atlas Prototype — nothing is sent to anyone</span>
          <span className="text-[11px] text-text-muted">Demo Mode</span>
        </div>

        {/* Global Header */}
        <header className="border-b border-border bg-surface px-6 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/" className="font-semibold text-base tracking-tight text-text hover:text-teal-primary transition-colors duration-150">
                GCC Atlas
              </Link>
              <nav className="flex items-center gap-4 text-sm font-normal">
                <Link
                  href="/planner"
                  className="text-text-muted hover:text-text transition-colors duration-150"
                >
                  Setup Planner
                </Link>
              </nav>
            </div>
            <div className="text-xs text-text-muted">
              Evidence-backed GCC advisory
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-border bg-surface px-6 py-6 text-xs text-text-muted">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              GCC Atlas Prototype. Every factual figure and incentive is backed by a verified source URL and as-of date.
            </div>
            <div>
              Light theme only &middot; Sourced figures
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
