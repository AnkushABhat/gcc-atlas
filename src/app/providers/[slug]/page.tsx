import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, ShieldCheck, MapPin, Globe } from "lucide-react";
import {
  getProvider,
  type ProviderCategory,
} from "@/modules/providers";
import { getSession } from "@/modules/auth";
import { ClaimButton } from "./claim-button";
import { ProviderLogo } from "@/components";

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

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Back link */}
      <div>
        <Link
          href="/providers"
          className="text-xs text-teal-primary hover:underline inline-flex items-center gap-1 font-medium"
        >
          &larr; All Providers
        </Link>
      </div>

      {/* Profile Card */}
      <div className="rounded-lg border border-border bg-surface p-6 sm:p-8 space-y-6">
        {/* Header with Title, Category, and Claim state */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-6 border-b border-border">
          <div className="flex items-start gap-4">
            <ProviderLogo
              providerSlug={provider.slug}
              providerName={provider.name}
              size="lg"
            />
            <div>
              <h1 className="text-2xl font-medium tracking-tight text-text">
                {provider.name}
              </h1>
              <div className="text-xs text-text-muted mt-1 font-medium flex items-center gap-2 flex-wrap">
                <span>{CATEGORY_LABELS[provider.category] || provider.category}</span>
                {provider.claimedAt && (
                  <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-accent-subtle text-accent border border-border inline-flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-accent" />
                    <span>Verified Profile</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div>
            <ClaimButton
              slug={provider.slug}
              isClaimed={isClaimed}
              isOwner={isOwner}
              currentRole={session.role}
              currentProviderSlug={session.providerSlug}
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1">
          <h2 className="text-xs font-medium text-text-muted">
            Overview
          </h2>
          <p className="text-sm text-text leading-relaxed">
            {provider.description}
          </p>
        </div>

        {/* Cities Served */}
        <div className="space-y-1.5">
          <h2 className="text-xs font-medium text-text-muted flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-accent shrink-0" />
            <span>Cities served</span>
          </h2>
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {provider.citiesServed.map((city) => (
              <span
                key={city}
                className="px-2.5 py-1 rounded text-xs bg-background border border-border text-text capitalize"
              >
                {city}
              </span>
            ))}
          </div>
        </div>

        {/* Website Link */}
        <div className="space-y-1.5">
          <h2 className="text-xs font-medium text-text-muted flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-accent shrink-0" />
            <span>Website</span>
          </h2>
          <a
            href={provider.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-teal-primary hover:underline inline-flex items-center gap-1 font-medium focus:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded-sm"
          >
            <span>{provider.website}</span>
            <ExternalLink className="w-3 h-3 shrink-0" />
          </a>
        </div>

        {/* Source Chip & Provenance */}
        <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-text-muted">
          <div>
            Source:{" "}
            <a
              href={provider.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-primary hover:underline"
            >
              {provider.sourceName}
            </a>{" "}
            &middot; As of {provider.asOf}
          </div>
          {provider.claimedAt && (
            <div className="text-[11px]">
              Claimed on {new Date(provider.claimedAt).toISOString().split("T")[0]}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
