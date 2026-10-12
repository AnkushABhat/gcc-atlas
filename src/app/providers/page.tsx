import React, { Suspense } from "react";
import Link from "next/link";
import {
  Compass,
  Building2,
  Users,
  Scale,
  Briefcase,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import {
  listProviders,
  PROVIDER_CATEGORIES,
  type ProviderCategory,
} from "@/modules/providers";
import { listCities } from "@/modules/cities";
import { ProvidersFilterBar } from "./filter-bar";
import { ProviderLogo } from "@/components";

export const metadata = {
  title: "Service Providers — GCC Atlas",
  description:
    "Vetted directory of GCC setup advisors, real estate partners, EOR, and legal counsel in India.",
};

const CATEGORY_ICONS: Record<ProviderCategory, React.ComponentType<{ className?: string }>> = {
  setup_advisor: Compass,
  real_estate: Building2,
  eor: Users,
  legal: Scale,
  recruiter: Briefcase,
};

const CATEGORY_LABELS: Record<ProviderCategory, string> = {
  setup_advisor: "Setup Advisor",
  real_estate: "Real Estate",
  eor: "Employer of Record",
  legal: "Legal",
  recruiter: "Recruiter",
};

interface ProvidersPageProps {
  searchParams: Promise<{
    category?: string;
    city?: string;
  }>;
}

export default async function ProvidersPage({
  searchParams,
}: ProvidersPageProps) {
  const params = await searchParams;
  const rawCategory = params.category;
  const citySlug = params.city;

  const validCategory = PROVIDER_CATEGORIES.includes(
    rawCategory as ProviderCategory
  )
    ? (rawCategory as ProviderCategory)
    : undefined;

  const [allCities, providers] = await Promise.all([
    listCities(),
    listProviders({
      category: validCategory,
      citySlug,
    }),
  ]);

  const categories = PROVIDER_CATEGORIES.map((cat) => ({
    id: cat,
    label: CATEGORY_LABELS[cat],
  }));

  const cityOptions = allCities.map((c) => ({
    slug: c.slug,
    name: c.name,
  }));

  return (
    <div className="relative space-y-6">
      {/* Subtle Ambient Background Texture */}
      <div
        className="ambient-glow-teal -top-24 -right-16 w-80 h-80 opacity-50 pointer-events-none"
        aria-hidden="true"
      />

      {/* Page Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-subtle text-accent border border-accent/20 text-xs font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-accent" />
          <span>Ecosystem Directory &middot; Zero Pay-to-Rank</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-text">
          Service Providers
        </h1>
        <p className="text-xs sm:text-sm text-text-muted mt-1 max-w-2xl leading-relaxed">
          Directory of firms supporting GCC setup in India across advisory, real
          estate, employer of record, and corporate legal services. Ordered
          strictly alphabetically.
        </p>
      </div>

      {/* Filter Controls */}
      <Suspense fallback={<div className="h-28 bg-surface rounded-2xl border border-border animate-pulse" />}>
        <ProvidersFilterBar
          categories={categories}
          cities={cityOptions}
          currentCategory={validCategory}
          currentCity={citySlug}
        />
      </Suspense>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-text-muted border-b border-border/80 pb-2.5">
        <span className="font-medium text-text">
          Showing {providers.length} {providers.length === 1 ? "provider" : "providers"}
        </span>
        <span className="text-[11px] text-text-muted bg-surface-raised px-2.5 py-0.5 rounded-full border border-border">
          Alphabetical order &middot; No pay-to-rank
        </span>
      </div>

      {/* Directory Content */}
      {providers.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface p-12 text-center space-y-3.5 shadow-subtle">
          <p className="text-sm text-text-muted">
            No providers match these filters. Clear filters.
          </p>
          <div>
            <Link
              href="/providers"
              className="inline-flex items-center px-4 py-2 rounded-xl bg-teal-primary text-white text-xs font-medium hover:bg-teal-hover transition-colors shadow-subtle focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Clear filters
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {providers.map((provider) => {
            const CategoryIcon = CATEGORY_ICONS[provider.category] || Briefcase;

            return (
              <div
                key={provider.slug}
                className="rounded-2xl border border-border bg-surface p-6 shadow-subtle hover:shadow-elevated hover:border-teal-primary/30 transition-all duration-200 flex flex-col justify-between group/card"
              >
                <div className="space-y-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3.5">
                      <ProviderLogo
                        providerSlug={provider.slug}
                        providerName={provider.name}
                        size="md"
                      />
                      <div>
                        <Link
                          href={`/providers/${provider.slug}`}
                          className="text-base font-semibold text-text hover:text-teal-primary transition-colors inline-flex items-center gap-1.5 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded-sm"
                        >
                          {provider.name}
                        </Link>
                        <div className="flex items-center gap-1.5 mt-0.5 text-xs text-text-muted">
                          <CategoryIcon className="w-3.5 h-3.5 text-accent shrink-0" />
                          <span>{CATEGORY_LABELS[provider.category] || provider.category}</span>
                        </div>
                      </div>
                    </div>

                    {provider.claimedAt && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-accent-subtle text-accent border border-accent/20 inline-flex items-center gap-1 shrink-0">
                        <ShieldCheck className="w-3 h-3 text-accent" />
                        <span>Claimed</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-[13px] text-text-muted leading-relaxed line-clamp-2">
                    {provider.description}
                  </p>

                  <div className="text-xs text-text-muted flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="font-medium text-text text-[11px]">Cities served:</span>
                    <div className="flex flex-wrap gap-1">
                      {provider.citiesServed.map((city) => (
                        <span
                          key={city}
                          className="px-2 py-0.5 rounded-md text-[11px] bg-surface-raised border border-border text-text capitalize"
                        >
                          {city}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3.5 border-t border-border flex items-center justify-between text-xs">
                  <div className="text-[11px] text-text-muted truncate max-w-[240px]">
                    Source: {provider.sourceName} &middot; {provider.asOf}
                  </div>
                  <Link
                    href={`/providers/${provider.slug}`}
                    className="group inline-flex items-center gap-1 text-xs text-teal-primary font-medium hover:text-teal-hover transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded-sm"
                  >
                    <span>View profile</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
