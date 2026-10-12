import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ExternalLink,
  ShieldCheck,
  MapPin,
  Globe,
  ArrowLeft,
  Compass,
  Building2,
  Users,
  Scale,
  Briefcase,
} from "lucide-react";
import {
  getProvider,
  type ProviderCategory,
} from "@/modules/providers";
import { getSession } from "@/modules/auth";
import { ClaimButton } from "./claim-button";
import { ProviderLogo } from "@/components";
import { InteractiveButton } from "@/components/InteractiveButton";

interface ProviderDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

const CATEGORY_LABELS: Record<ProviderCategory, string> = {
  setup_advisor: "Setup Advisor",
  real_estate: "Real Estate",
  eor: "Employer of Record",
  legal: "Legal",
  recruiter: "Recruiter",
};

const CATEGORY_ICONS: Record<ProviderCategory, React.ComponentType<{ className?: string }>> = {
  setup_advisor: Compass,
  real_estate: Building2,
  eor: Users,
  legal: Scale,
  recruiter: Briefcase,
};

export async function generateMetadata({ params }: ProviderDetailPageProps) {
  const { slug } = await params;
  const provider = await getProvider(slug);
  if (!provider) {
    return { title: "Provider Not Found — GCC Atlas" };
  }
  return {
    title: `${provider.name} — Service Provider Profile — GCC Atlas`,
    description: provider.description,
  };
}

export default async function ProviderDetailPage({
  params,
}: ProviderDetailPageProps) {
  const { slug } = await params;
  const [provider, session] = await Promise.all([
    getProvider(slug),
    getSession(),
  ]);

  if (!provider) {
    notFound();
  }

  const isClaimed = Boolean(provider.claimedAt);
  const isOwner =
    isClaimed &&
    session.role === "provider" &&
    session.providerSlug === provider.slug;

  const CategoryIcon = CATEGORY_ICONS[provider.category] || Briefcase;

  return (
    <div className="max-w-4xl mx-auto space-y-6 relative">
      {/* Subtle Ambient Background Glow */}
      <div
        className="ambient-glow-teal -top-24 -right-16 w-80 h-80 opacity-40 pointer-events-none"
        aria-hidden="true"
      />

      {/* Back link */}
      <div>
        <Link
          href="/providers"
          className="inline-flex items-center gap-1.5 text-xs text-teal-primary hover:text-teal-hover hover:underline font-medium transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All Providers</span>
        </Link>
      </div>

      {/* Profile Card */}
      <div className="relative rounded-3xl border border-border bg-surface p-6 sm:p-10 space-y-8 shadow-elevated overflow-hidden">
        {/* Header with Title, Category, and Action Buttons */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 border-b border-border">
          <div className="flex items-start gap-4 sm:gap-5">
            <ProviderLogo
              providerSlug={provider.slug}
              providerName={provider.name}
              size="lg"
            />
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-text">
                {provider.name}
              </h1>
              <div className="text-xs text-text-muted font-medium flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 text-text">
                  <CategoryIcon className="w-3.5 h-3.5 text-accent shrink-0" />
                  <span>{CATEGORY_LABELS[provider.category] || provider.category}</span>
                </span>
                {provider.claimedAt && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-accent-subtle text-accent border border-accent/20 inline-flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-accent" />
                    <span>Verified Profile</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <InteractiveButton
              href={`/request-intro?chosenProviderSlug=${provider.slug}&category=${provider.category}`}
              variant="primary"
              size="md"
            >
              Request Introduction
            </InteractiveButton>
            <ClaimButton
              slug={provider.slug}
              isClaimed={isClaimed}
              isOwner={isOwner}
              currentRole={session.role}
              currentProviderSlug={session.providerSlug}
            />
          </div>
        </div>

        {/* Structured Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="rounded-2xl border border-border bg-surface-raised p-4 space-y-1">
            <span className="text-[11px] font-medium text-text-muted uppercase tracking-wider block">
              Engagement Model
            </span>
            <span className="text-sm font-semibold text-text block">
              Direct Client Retainer
            </span>
            <span className="text-[11px] text-text-muted block">
              Direct engagement &middot; Zero platform commission
            </span>
          </div>

          <div className="rounded-2xl border border-border bg-surface-raised p-4 space-y-1">
            <span className="text-[11px] font-medium text-text-muted uppercase tracking-wider block">
              Geographic Coverage
            </span>
            <span className="text-sm font-semibold text-text block">
              {provider.citiesServed.length} Strategic Hubs
            </span>
            <span className="text-[11px] text-text-muted block">
              Active operations in major tier-1 & 2 cities
            </span>
          </div>

          <div className="rounded-2xl border border-border bg-surface-raised p-4 space-y-1">
            <span className="text-[11px] font-medium text-text-muted uppercase tracking-wider block">
              Proven Client Focus
            </span>
            <span className="text-sm font-semibold text-text block">
              Global Capability Centers
            </span>
            <span className="text-[11px] text-text-muted block">
              Multinational tech & enterprise subsidiaries
            </span>
          </div>
        </div>

        {/* Description / Overview */}
        <div className="space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            Overview
          </h2>
          <p className="text-sm sm:text-base text-text leading-relaxed">
            {provider.description}
          </p>
        </div>

        {/* Cities Served */}
        <div className="space-y-2.5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-accent shrink-0" />
            <span>Cities served ({provider.citiesServed.length})</span>
          </h2>
          <div className="flex flex-wrap gap-2">
            {provider.citiesServed.map((city) => (
              <span
                key={city}
                className="px-3 py-1 rounded-xl text-xs bg-surface-raised border border-border text-text capitalize font-medium"
              >
                {city}
              </span>
            ))}
          </div>
        </div>

        {/* Website Link */}
        <div className="space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-accent shrink-0" />
            <span>Website</span>
          </h2>
          <a
            href={provider.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs sm:text-sm text-teal-primary hover:underline inline-flex items-center gap-1.5 font-medium focus:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded-sm"
          >
            <span>{provider.website}</span>
            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
          </a>
        </div>

        {/* Source Chip & Provenance */}
        <div className="pt-5 border-t border-border flex items-center justify-between text-xs text-text-muted flex-wrap gap-3">
          <div>
            Source:{" "}
            <a
              href={provider.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-primary hover:underline font-medium"
            >
              {provider.sourceName}
            </a>{" "}
            &middot; As of {provider.asOf}
          </div>
          {provider.claimedAt && (
            <div className="text-[11px] text-text-muted bg-surface-raised px-2.5 py-0.5 rounded-full border border-border">
              Claimed on {new Date(provider.claimedAt).toISOString().split("T")[0]}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
