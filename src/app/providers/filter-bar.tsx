"use client";

import React, { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Filter, X } from "lucide-react";
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
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-subtle space-y-4">
      {/* Category Pills Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-text-muted flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-accent" />
            <span>Category:</span>
          </span>
          {hasActiveFilters && (
            <Link
              href="/providers"
              className="inline-flex items-center gap-1 text-xs text-teal-primary hover:text-teal-hover hover:underline font-medium"
            >
              <X className="w-3 h-3" />
              <span>Clear filters</span>
            </Link>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleFilterChange("category", "")}
            disabled={isPending}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 cursor-pointer ${
              !currentCategory
                ? "bg-teal-primary text-white shadow-subtle"
                : "bg-surface-raised hover:bg-surface text-text-muted hover:text-text border border-border hover:border-border-strong"
            }`}
          >
            All categories
          </button>
          {categories.map((cat) => {
            const isActive = currentCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleFilterChange("category", cat.id)}
                disabled={isPending}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 cursor-pointer ${
                  isActive
                    ? "bg-teal-primary text-white shadow-subtle"
                    : "bg-surface-raised hover:bg-surface text-text-muted hover:text-text border border-border hover:border-border-strong"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dropdown Filters Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-border/80">
        <div className="flex flex-wrap items-center gap-4">
          {/* Category filter select */}
          <div className="flex items-center gap-2">
            <label
              htmlFor="category-filter"
              className="text-xs text-text-muted font-medium"
            >
              Category:
            </label>
            <select
              id="category-filter"
              value={currentCategory || ""}
              onChange={(e) => handleFilterChange("category", e.target.value)}
              disabled={isPending}
              className="bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-text focus:outline-none focus:ring-2 focus:ring-teal-primary/40 focus:border-teal-primary cursor-pointer disabled:opacity-50 transition-all"
            >
              <option value="">All categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* City filter select */}
          <div className="flex items-center gap-2">
            <label
              htmlFor="city-filter"
              className="text-xs text-text-muted font-medium"
            >
              City served:
            </label>
            <select
              id="city-filter"
              value={currentCity || ""}
              onChange={(e) => handleFilterChange("city", e.target.value)}
              disabled={isPending}
              className="bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-text focus:outline-none focus:ring-2 focus:ring-teal-primary/40 focus:border-teal-primary cursor-pointer disabled:opacity-50 transition-all"
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

        {isPending && (
          <span className="text-[11px] text-teal-primary font-medium animate-pulse">
            Filtering directory...
          </span>
        )}
      </div>
    </div>
  );
}
