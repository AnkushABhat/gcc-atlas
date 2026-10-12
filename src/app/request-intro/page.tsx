import React from "react";
import { ShieldCheck } from "lucide-react";
import { listCities } from "@/modules/cities";
import {
  listProviders,
  PROVIDER_CATEGORIES,
  type ProviderCategory,
} from "@/modules/providers";
import { IntroForm } from "./intro-form";

export const metadata = {
  title: "Request Introduction — GCC Atlas",
  description:
    "Request qualified introductions to vetted GCC setup advisors, real estate brokers, and legal counsel in India.",
};

const CATEGORY_LABELS: Record<ProviderCategory, string> = {
  setup_advisor: "Setup Advisor",
  real_estate: "Real Estate",
  eor: "Employer of Record",
  legal: "Legal",
  recruiter: "Recruiter",
};

interface RequestIntroPageProps {
  searchParams: Promise<{
    provider?: string;
  }>;
}

export default async function RequestIntroPage({
  searchParams,
}: RequestIntroPageProps) {
  const params = await searchParams;
  const preselectedProvider = params.provider;

  const [cities, providers] = await Promise.all([
    listCities(),
    listProviders(),
  ]);

  const categories = PROVIDER_CATEGORIES.map((cat) => ({
    id: cat,
    label: CATEGORY_LABELS[cat],
  }));

  const cityOptions = cities.map((c) => ({
    slug: c.slug,
    name: c.name,
  }));

  const providerOptions = providers.map((p) => ({
    slug: p.slug,
    name: p.name,
    category: CATEGORY_LABELS[p.category] || p.category,
  }));

  return (
    <div className="max-w-3xl mx-auto space-y-6 relative">
      {/* Subtle Ambient Background Texture */}
      <div
        className="ambient-glow-teal -top-24 -right-16 w-80 h-80 opacity-40 pointer-events-none"
        aria-hidden="true"
      />

      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-subtle text-accent border border-accent/20 text-xs font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-accent" />
          <span>Qualified Lead Matching &middot; Max 3 Providers</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-text">
          Request an Introduction
        </h1>
        <p className="text-xs sm:text-sm text-text-muted mt-1 leading-relaxed">
          Submit your GCC setup requirements. Matches are routed to at most 3
          eligible providers based on category, city coverage, and fair rotation.
        </p>
      </div>

      <IntroForm
        cities={cityOptions}
        categories={categories}
        providers={providerOptions}
        preselectedProvider={preselectedProvider}
      />
    </div>
  );
}
