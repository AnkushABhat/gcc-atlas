import React from "react";
import Link from "next/link";
import {
  Compass,
  Building2,
  Users,
  Landmark,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { listCities, getAllLatestFacts, listIncentives } from "@/modules/cities";
import { countOperatingByCity } from "@/modules/gccs";
import { listProviders } from "@/modules/providers";
import { ProviderLogo } from "@/components";
import { MarqueeTicker } from "@/components/MarqueeTicker";
import { InteractiveButton } from "@/components/InteractiveButton";
import { FloatingHighlightCard } from "@/components/FloatingHighlightCard";

export default async function HomePage() {
  const [cities, allFacts, gccCounts, allIncentives, providers] = await Promise.all([
    listCities(),
    getAllLatestFacts(),
    countOperatingByCity(),
    listIncentives(),
    listProviders(),
  ]);

  // Aggregate key figures
  const totalCities = cities.length;
  const totalIncentives = allIncentives.length;
  const totalGccs = Object.values(gccCounts).reduce((a, b) => a + b, 0);
  const totalProviders = providers.length;

  return (
    <div className="space-y-16 py-4">
      {/* Hero Section with Ambient Glow & 2-Column Desktop Grid */}
      <section className="relative overflow-hidden pt-4 pb-2">
        {/* Ambient Teal Radial Mesh Glow */}
        <div
          className="ambient-glow-teal -top-24 -left-20 w-[480px] h-[480px] opacity-70"
          aria-hidden="true"
        />
        <div
          className="ambient-glow-teal top-1/4 -right-24 w-[420px] h-[420px] opacity-60"
          aria-hidden="true"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Heading, Provenance Pill & Interactive Actions */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-subtle text-accent border border-accent/20 text-xs font-medium shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>Single source of truth for GCC leaders &middot; Zero invented data</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-text leading-[1.18]">
              Data-backed planning for GCC setup in India
            </h1>

            <p className="text-base text-text-muted leading-relaxed max-w-2xl">
              Model talent density, commercial office leasing rates, and verified state industrial incentives across major Indian technology hubs. Ranked purely on auditable public figures, with zero imputed estimates.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3.5">
              <InteractiveButton
                href="/planner"
                variant="primary"
                size="lg"
                showArrow={true}
              >
                <Compass className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Launch Setup Planner</span>
              </InteractiveButton>

              <InteractiveButton
                href="/providers"
                variant="secondary"
                size="lg"
                showArrow={false}
              >
                <Building2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Browse Vetted Providers ({totalProviders})</span>
              </InteractiveButton>
            </div>
          </div>

          {/* Right Column: Floating Highlight Cards Showcase */}
          <div className="lg:col-span-5 relative flex flex-col gap-3.5 pt-2 lg:pt-0" aria-hidden="true">
            <FloatingHighlightCard
              title="Top Ranked Hub · Talent & Scale"
              value="Bengaluru"
              subtitle="1,000,000+ tech talent · ₹140–₹185/sq ft"
              badge="Top Match"
              icon={<Sparkles className="w-3.5 h-3.5 text-accent" />}
              animate={true}
              className="transform lg:-rotate-1 hover:rotate-0 transition-transform shadow-elevated"
            />

            <FloatingHighlightCard
              title="Commercial Office Rent Range"
              value="₹45 – ₹185"
              subtitle="₹ / sq ft / month across 6 hubs"
              badge="100% Sourced"
              icon={<Building2 className="w-3.5 h-3.5 text-accent" />}
              className="transform lg:translate-x-3 lg:rotate-1 hover:rotate-0 transition-transform shadow-elevated"
            />

            <FloatingHighlightCard
              title="Verified Industrial Policies"
              value={`${totalIncentives} Policies`}
              subtitle="Capital subsidies, stamp duty & power tariffs"
              badge="Zero Imputation"
              icon={<ShieldCheck className="w-3.5 h-3.5 text-accent" />}
              className="transform lg:-translate-x-2 lg:-rotate-1 hover:rotate-0 transition-transform shadow-elevated"
            />
          </div>
        </div>
      </section>

      {/* Infinite Continuous Benchmark & Ecosystem Marquee Ticker */}
      <section className="pt-2">
        <MarqueeTicker
          label="Operating Benchmark GCCs & Ecosystem Partners"
          speedSeconds={35}
          className="rounded-2xl border border-border/80 bg-surface/60 backdrop-blur-xs p-4 shadow-subtle"
        />
      </section>

      {/* KPI Stats Strip — Elevated rounded-2xl Cards */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-border bg-surface p-5 space-y-1.5 shadow-subtle hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-200 group">
          <div className="text-2xl sm:text-3xl font-medium font-mono text-text tabular-nums tracking-tight">
            {totalCities} Hubs
          </div>
          <div className="text-xs text-text-muted font-normal flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-accent shrink-0 group-hover:scale-110 transition-transform" />
            <span>Tier-1 & 2 technology centers</span>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5 space-y-1.5 shadow-subtle hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-200 group">
          <div className="text-2xl sm:text-3xl font-medium font-mono text-text tabular-nums tracking-tight">
            {totalIncentives} Policies
          </div>
          <div className="text-xs text-text-muted font-normal flex items-center gap-1.5">
            <Landmark className="w-3.5 h-3.5 text-accent shrink-0 group-hover:scale-110 transition-transform" />
            <span>Verified state incentives</span>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5 space-y-1.5 shadow-subtle hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-200 group">
          <div className="text-2xl sm:text-3xl font-medium font-mono text-text tabular-nums tracking-tight">
            {totalGccs} GCCs
          </div>
          <div className="text-xs text-text-muted font-normal flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-accent shrink-0 group-hover:scale-110 transition-transform" />
            <span>Operating benchmark centers</span>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5 space-y-1.5 shadow-subtle hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-200 group">
          <div className="text-2xl sm:text-3xl font-medium font-mono text-text tabular-nums tracking-tight">
            100% Sourced
          </div>
          <div className="text-xs text-text-muted font-normal flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-accent shrink-0 group-hover:scale-110 transition-transform" />
            <span>Zero invented or guessed numbers</span>
          </div>
        </div>
      </section>

      {/* Location Intelligence Matrix Card Container */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-border pb-3">
          <div>
            <h2 className="text-lg font-medium text-text tracking-tight">
              Location Intelligence Matrix
            </h2>
            <p className="text-xs text-text-muted mt-0.5">
              Comparative benchmark across talent pools, commercial office leasing, and operating GCC density.
            </p>
          </div>
          <Link
            href="/planner"
            className="text-xs text-teal-primary hover:underline font-medium inline-flex items-center gap-1 shrink-0 group"
          >
            <span>Model weights in Planner</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="rounded-2xl border border-border bg-surface shadow-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-surface-raised/70 text-text-muted font-medium">
                  <th className="py-3 px-4">City</th>
                  <th className="py-3 px-4">State</th>
                  <th className="py-3 px-4">Tech Talent Pool</th>
                  <th className="py-3 px-4">Office Rent (₹/sq.ft/mo)</th>
                  <th className="py-3 px-4">Operating GCCs</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {cities.map((city) => {
                  const cityFacts = allFacts[city.slug] ?? {};
                  const rentRaw = cityFacts["office_rent_inr_sqft_month"];
                  const talentRaw = cityFacts["tech_talent_count"];
                  const gccCount = gccCounts[city.slug] ?? 0;

                  return (
                    <tr
                      key={city.slug}
                      className="hover:bg-surface-raised/70 transition-colors duration-150"
                    >
                      <td className="py-3 px-4 font-medium text-text">
                        {city.name}
                      </td>
                      <td className="py-3 px-4 text-text-muted capitalize">
                        {city.stateName}
                      </td>
                      <td className="py-3 px-4 text-text tabular-nums">
                        {talentRaw ? (
                          <span>{(talentRaw.valueMin / 1000).toLocaleString("en-IN")}k+ engineers</span>
                        ) : (
                          <span className="text-text-muted italic">Not reported</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-text tabular-nums">
                        {rentRaw ? (
                          <span>₹{rentRaw.valueMin} – ₹{rentRaw.valueMax}</span>
                        ) : (
                          <span className="text-text-muted italic">Not reported</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-text tabular-nums">
                        {gccCount > 0 ? (
                          <span className="inline-flex items-center gap-1 font-medium text-text">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-primary" />
                            {gccCount} verified
                          </span>
                        ) : (
                          <span className="text-text-muted">Growing hub</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/planner?city=${city.slug}`}
                          className="text-teal-primary font-medium hover:underline inline-flex items-center gap-1 group"
                        >
                          <span>Analyze</span>
                          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Core Capabilities Pillars — Elevated Cards */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-medium text-text tracking-tight">
            How Leaders Use GCC Atlas
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            Three interconnected modules that take you from initial location screening to partner selection.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="rounded-2xl border border-border bg-surface p-6 space-y-4 flex flex-col justify-between shadow-subtle hover:shadow-elevated hover:border-accent/40 transition-all duration-200 group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-accent-subtle text-accent border border-accent/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-medium text-text">
                Multi-Factor Setup Planner
              </h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Rank candidate cities by customizing strategic priority weights (Talent, Cost, Ecosystem, and Incentives). Get dynamic office budget estimations formatted in INR lakhs and crores.
              </p>
            </div>
            <Link
              href="/planner"
              className="text-xs font-medium text-teal-primary hover:underline inline-flex items-center gap-1 pt-2 group-hover:gap-1.5 transition-all"
            >
              <span>Explore Planner</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-6 space-y-4 flex flex-col justify-between shadow-subtle hover:shadow-elevated hover:border-accent/40 transition-all duration-200 group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-accent-subtle text-accent border border-accent/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Landmark className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-medium text-text">
                State Incentives Navigator
              </h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Filter industrial policies and state IT frameworks by planned headcount and functional scope. View exact capital subsidies, stamp duty exemptions, and power tariff concessions.
              </p>
            </div>
            <Link
              href="/planner"
              className="text-xs font-medium text-teal-primary hover:underline inline-flex items-center gap-1 pt-2 group-hover:gap-1.5 transition-all"
            >
              <span>View Policy Matches</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-6 space-y-4 flex flex-col justify-between shadow-subtle hover:shadow-elevated hover:border-accent/40 transition-all duration-200 group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-accent-subtle text-accent border border-accent/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-medium text-text">
                Vetted Provider Introductions
              </h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Connect with leading setup advisors, commercial real estate firms, legal counsel, and employer of record partners. Introductions are capped at 3 matched providers with fair rotation.
              </p>
            </div>
            <Link
              href="/providers"
              className="text-xs font-medium text-teal-primary hover:underline inline-flex items-center gap-1 pt-2 group-hover:gap-1.5 transition-all"
            >
              <span>Browse Directory</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Provider Logo Showcase — Modernized Cards */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h2 className="text-lg font-medium text-text tracking-tight">
              Vetted Provider Ecosystem
            </h2>
            <p className="text-xs text-text-muted mt-0.5">
              Verified partners across advisory, commercial real estate, EOR, and corporate legal services.
            </p>
          </div>
          <Link
            href="/providers"
            className="text-xs text-teal-primary hover:underline font-medium inline-flex items-center gap-1 shrink-0 group"
          >
            <span>All {providers.length} providers</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {providers.map((p) => (
            <Link
              key={p.slug}
              href={`/providers/${p.slug}`}
              className="rounded-2xl border border-border bg-surface p-4 flex flex-col items-center text-center shadow-subtle hover:shadow-elevated hover:border-teal-primary/40 hover:-translate-y-0.5 transition-all duration-200 group"
            >
              <ProviderLogo
                providerSlug={p.slug}
                providerName={p.name}
                size="md"
                className="mb-2.5 group-hover:scale-105 transition-transform duration-200"
              />
              <span className="text-xs font-medium text-text group-hover:text-teal-primary transition-colors">
                {p.name}
              </span>
              <span className="text-[11px] text-text-muted capitalize mt-0.5">
                {p.category.replace("_", " ")}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 4-Step Connected Workflow Stepper */}
      <section className="rounded-2xl border border-border bg-surface p-6 sm:p-8 space-y-6 shadow-subtle">
        <div>
          <h2 className="text-lg font-medium text-text tracking-tight">
            How the End-to-End Workflow Works
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            From initial parameters to verified partner contact in four clean steps.
          </p>
        </div>

        <div className="relative grid grid-cols-1 sm:grid-cols-4 gap-6">
          <div className="space-y-2.5 relative">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-accent-subtle text-accent border border-accent/20 flex items-center justify-center text-xs font-mono font-medium shadow-xs">
                01
              </span>
              <span className="text-xs font-medium text-accent">Model Requirements</span>
            </div>
            <h3 className="text-sm font-medium text-text">Define Scale & Priorities</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Enter target headcount, functional scope, and strategic weightings between talent, rent, and incentives.
            </p>
          </div>

          <div className="space-y-2.5 relative">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-accent-subtle text-accent border border-accent/20 flex items-center justify-center text-xs font-mono font-medium shadow-xs">
                02
              </span>
              <span className="text-xs font-medium text-accent">Inspect Evidence</span>
            </div>
            <h3 className="text-sm font-medium text-text">Verify Empirical Figures</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Review empirical city rankings and monthly office cost projections. Click any number to audit its official source URL.
            </p>
          </div>

          <div className="space-y-2.5 relative">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-accent-subtle text-accent border border-accent/20 flex items-center justify-center text-xs font-mono font-medium shadow-xs">
                03
              </span>
              <span className="text-xs font-medium text-accent">Match Subsidies</span>
            </div>
            <h3 className="text-sm font-medium text-text">Identify State Policies</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Identify state government capital subsidies and stamp duty waivers tailored to your scale.
            </p>
          </div>

          <div className="space-y-2.5 relative">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-accent-subtle text-accent border border-accent/20 flex items-center justify-center text-xs font-mono font-medium shadow-xs">
                04
              </span>
              <span className="text-xs font-medium text-accent">Request Intros</span>
            </div>
            <h3 className="text-sm font-medium text-text">Connect with Specialists</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Submit an intro request routed to at most 3 matched providers through our fair, unbiased lead marketplace.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

