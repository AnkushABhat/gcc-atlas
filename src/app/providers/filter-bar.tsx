"use client";

import React, { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import type { ProviderCategory } from "@/modules/providers";

interface CityOption {
  slug: string;
  name: string;
}

interface FilterBarProps {
  categories: Array<{ id: ProviderCategory; label: string }>;
  cities: CityOption[];
  currentCategory?: string;
  currentCity?: string;
}

export function ProvidersFilterBar({
  categories,
  cities,
  currentCategory,
  currentCity,
}: FilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    startTransition(() => {
      const qs = params.toString();
      router.push(qs ? `/providers?${qs}` : "/providers");
    });
  };

  const hasActiveFilters = Boolean(currentCategory || currentCity);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-lg border border-border bg-surface">
      <div className="flex flex-wrap items-center gap-4">
        {/* Category filter */}
        <div className="flex items-center gap-2">
          <label htmlFor="category-filter" className="text-xs text-text-muted font-medium">
            Category:
          </label>
          <select
            id="category-filter"
            value={currentCategory || ""}
            onChange={(e) => handleFilterChange("category", e.target.value)}
            disabled={isPending}
            className="bg-background border border-border rounded px-2.5 py-1 text-xs text-text focus:outline-none focus:ring-1 focus:ring-teal-primary cursor-pointer disabled:opacity-50"
          >
            <option value="">All categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* City filter */}
        <div className="flex items-center gap-2">
          <label htmlFor="city-filter" className="text-xs text-text-muted font-medium">
            City served:
          </label>
          <select
            id="city-filter"
            value={currentCity || ""}
            onChange={(e) => handleFilterChange("city", e.target.value)}
            disabled={isPending}
            className="bg-background border border-border rounded px-2.5 py-1 text-xs text-text focus:outline-none focus:ring-1 focus:ring-teal-primary cursor-pointer disabled:opacity-50"
          >
            <option value="">All cities</option>
            {cities.map((city) => (
              <option key={city.slug} value={city.slug}>
                {city.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Clear filters action */}
      {hasActiveFilters && (
        <Link
          href="/providers"
          className="text-xs text-teal-primary hover:underline font-medium"
        >
          Clear filters
        </Link>
      )}
    </div>
  );
}
