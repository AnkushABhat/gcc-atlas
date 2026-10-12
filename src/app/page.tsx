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
} from "lucide-react";
import { listCities, getAllLatestFacts, listIncentives } from "@/modules/cities";
import { countOperatingByCity } from "@/modules/gccs";
import { listProviders } from "@/modules/providers";
import { ProviderLogo } from "@/components";

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
      {/* Hero Section */}
      <section className="space-y-6 max-w-4xl">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-sm bg-accent-subtle text-accent border border-border text-xs font-medium">
          <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
          <span>Single source of truth for GCC leaders &middot; Zero invented data</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-text leading-tight">
          Data-backed planning for GCC setup in India
        </h1>

        <p className="text-base text-text-muted leading-relaxed max-w-3xl">
          Model talent density, commercial office leasing rates, and verified state industrial incentives across major Indian technology hubs. Ranked purely on auditable public figures, with zero imputed estimates.
        </p>

        <div className="pt-2 flex flex-wrap items-center gap-3">
          <Link
            href="/planner"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-sm bg-teal-primary hover:bg-teal-hover text-white text-sm font-medium transition-colors duration-150 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent"
          >
            <Compass className="w-4 h-4 shrink-0" />
            <span>Launch Setup Planner</span>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </Link>

          <Link
            href="/providers"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-sm bg-surface hover:bg-background border border-border text-text text-sm font-medium transition-colors duration-150 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent"
          >
            <Building2 className="w-4 h-4 shrink-0 text-text-muted" />
            <span>Browse Vetted Providers ({totalProviders})</span>
          </Link>
        </div>
      </section>

      {/* KPI Stats Strip */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-lg border border-border bg-surface">
        <div className="space-y-1">
          <div className="text-2xl font-medium text-text tabular-nums tracking-tight">
            {totalCities} Hubs
          </div>
          <div className="text-xs text-text-muted font-normal flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-accent shrink-0" />
            <span>Tier-1 & 2 technology centers</span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-2xl font-medium text-text tabular-nums tracking-tight">
            {totalIncentives} Policies
          </div>
          <div className="text-xs text-text-muted font-normal flex items-center gap-1.5">
            <Landmark className="w-3.5 h-3.5 text-accent shrink-0" />
            <span>Verified state incentives</span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-2xl font-medium text-text tabular-nums tracking-tight">
            {totalGccs} GCCs
          </div>
          <div className="text-xs text-text-muted font-normal flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-accent shrink-0" />
            <span>Operating benchmark centers</span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-2xl font-medium text-text tabular-nums tracking-tight">
            100% Sourced
          </div>
          <div className="text-xs text-text-muted font-normal flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-accent shrink-0" />
            <span>Zero invented or guessed numbers</span>
          </div>
        </div>
      </section>

      {/* City Intelligence Matrix Preview */}
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
            className="text-xs text-teal-primary hover:underline font-medium inline-flex items-center gap-1 shrink-0"
          >
            <span>Model weights in Planner</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="rounded-lg border border-border bg-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-background/50 text-text-muted font-medium">
                  <th className="py-2.5 px-4">City</th>
                  <th className="py-2.5 px-4">State</th>
                  <th className="py-2.5 px-4">Tech Talent Pool</th>
                  <th className="py-2.5 px-4">Office Rent (₹/sq.ft/mo)</th>
                  <th className="py-2.5 px-4">Operating GCCs</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
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
                      className="hover:bg-background/40 transition-colors duration-150"
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
                          className="text-teal-primary font-medium hover:underline inline-flex items-center gap-1"
                        >
                          <span>Analyze</span>
                          <ArrowRight className="w-3 h-3" />
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

      {/* Core Capabilities Pillars */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-medium text-text tracking-tight">
            How Leaders Use GCC Atlas
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            Three interconnected modules that take you from initial location screening to partner selection.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg border border-border bg-surface p-5 space-y-3 flex flex-col justify-between hover:border-teal-primary/40 transition-colors duration-150">
            <div className="space-y-3">
              <div className="w-9 h-9 rounded-md bg-accent-subtle text-accent border border-border flex items-center justify-center">
                <Compass className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-medium text-text">
                Multi-Factor Setup Planner
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Rank candidate cities by customizing strategic priority weights (Talent, Cost, Ecosystem, and Incentives). Get dynamic office budget estimations formatted in INR lakhs and crores.
              </p>
            </div>
            <Link
              href="/planner"
              className="text-xs font-medium text-teal-primary hover:underline inline-flex items-center gap-1 pt-2"
            >
              <span>Explore Planner</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="rounded-lg border border-border bg-surface p-5 space-y-3 flex flex-col justify-between hover:border-teal-primary/40 transition-colors duration-150">
            <div className="space-y-3">
              <div className="w-9 h-9 rounded-md bg-accent-subtle text-accent border border-border flex items-center justify-center">
                <Landmark className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-medium text-text">
                State Incentives Navigator
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Filter industrial policies and state IT frameworks by planned headcount and functional scope. View exact capital subsidies, stamp duty exemptions, and power tariff concessions.
              </p>
            </div>
            <Link
              href="/planner"
              className="text-xs font-medium text-teal-primary hover:underline inline-flex items-center gap-1 pt-2"
            >
              <span>View Policy Matches</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="rounded-lg border border-border bg-surface p-5 space-y-3 flex flex-col justify-between hover:border-teal-primary/40 transition-colors duration-150">
            <div className="space-y-3">
              <div className="w-9 h-9 rounded-md bg-accent-subtle text-accent border border-border flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-medium text-text">
                Vetted Provider Introductions
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Connect with leading setup advisors, commercial real estate firms, legal counsel, and employer of record partners. Introductions are capped at 3 matched providers with fair rotation.
              </p>
            </div>
            <Link
              href="/providers"
              className="text-xs font-medium text-teal-primary hover:underline inline-flex items-center gap-1 pt-2"
            >
              <span>Browse Directory</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* Provider Logo Showcase */}
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
            className="text-xs text-teal-primary hover:underline font-medium inline-flex items-center gap-1 shrink-0"
          >
            <span>All {providers.length} providers</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {providers.map((p) => (
            <Link
              key={p.slug}
              href={`/providers/${p.slug}`}
              className="rounded-lg border border-border bg-surface p-4 flex flex-col items-center text-center hover:border-teal-primary/40 transition-colors duration-150 group"
            >
              <ProviderLogo
                providerSlug={p.slug}
                providerName={p.name}
                size="md"
                className="mb-2.5 group-hover:scale-105 transition-transform duration-150"
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

      {/* 4-Step Workflow Stepper */}
      <section className="rounded-lg border border-border bg-surface p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-lg font-medium text-text tracking-tight">
            How the End-to-End Workflow Works
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            From initial parameters to verified partner contact in four clean steps.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          <div className="space-y-2">
            <div className="text-xs font-medium text-accent">Step 01</div>
            <h3 className="text-sm font-medium text-text">Model Requirements</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Enter target headcount, functional scope, and strategic weightings between talent, rent, and incentives.
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-medium text-accent">Step 02</div>
            <h3 className="text-sm font-medium text-text">Inspect Evidence</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Review empirical city rankings and monthly office cost projections. Click any number to audit its official source URL.
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-medium text-accent">Step 03</div>
            <h3 className="text-sm font-medium text-text">Match Subsidies</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Identify state government capital subsidies and stamp duty waivers tailored to your scale.
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-medium text-accent">Step 04</div>
            <h3 className="text-sm font-medium text-text">Request Intros</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Submit an intro request routed to at most 3 matched providers through our fair, unbiased lead marketplace.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
