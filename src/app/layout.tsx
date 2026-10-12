import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import "./globals.css";
import { getSession } from "@/modules/auth";
import { listProviders } from "@/modules/providers";
import { DemoBanner, VisualGuide, GuideTrigger } from "@/components";

export const metadata: Metadata = {
  title: "GCC Atlas — Single source of truth for Indian GCCs",
  description: "Interactive planner and vetted directory for setting up Global Capability Centres in India.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, providersList] = await Promise.all([
    getSession(),
    listProviders().catch(() => []),
  ]);

  const availableProviders = providersList.map((p) => ({
    slug: p.slug,
    name: p.name,
  }));

  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-background text-text">
        {/* Prototype persistent banner per ADR 006 */}
        <DemoBanner
          currentSession={session}
          availableProviders={availableProviders}
        />

        {/* First-time viewer interactive visual guide with skip ability */}
        <VisualGuide />

        {/* Global Header */}
        <header className="border-b border-border gradient-header px-6 py-3.5 sticky top-0 z-20 backdrop-blur-xs shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link
                href="/"
                className="font-medium text-base tracking-tight text-text hover:text-teal-primary transition-colors duration-150 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded-sm inline-flex items-center gap-2.5"
              >
                <Image
                  src="/logos/gcc-atlas-icon.svg"
                  alt="GCC Atlas emblem"
                  width={22}
                  height={22}
                  className="rounded-xs shrink-0"
                  priority
                />
                <span>GCC Atlas</span>
              </Link>
              <nav className="flex items-center gap-4 text-sm font-normal">
                <Link
                  href="/planner"
                  className="text-text-muted hover:text-text transition-colors duration-150 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded-sm"
                >
                  Setup Planner
                </Link>
                <Link
                  href="/providers"
                  className="text-text-muted hover:text-text transition-colors duration-150 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded-sm"
                >
                  Providers
                </Link>
                <Link
                  href="/request-intro"
                  className="text-text-muted hover:text-text transition-colors duration-150 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded-sm"
                >
                  Request Intro
                </Link>
                <Link
                  href="/inbox"
                  className="text-text-muted hover:text-text transition-colors duration-150 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded-sm"
                >
                  Inbox
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <GuideTrigger />
              <div className="text-xs text-text-muted hidden sm:block">
                Evidence-backed GCC advisory
              </div>
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
