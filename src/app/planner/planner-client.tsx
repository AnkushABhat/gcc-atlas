"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  PlannerCityData,
  PlannerInput,
  Factor,
  rankCities,
} from "../../modules/planner";
import { Money } from "../../components/Money";
import { SourcedValue } from "../../components/SourcedValue";
import { FactorBar } from "../../components/FactorBar";
import {
  Building2,
  Sliders,
  AlertCircle,
  FileText,
  ExternalLink,
  ChevronDown,
  Users,
  Globe,
  Landmark,
  Sparkles,
  ArrowRight,
} from "lucide-react";

interface PlannerClientProps {
  initialCities: PlannerCityData[];
}

const ALL_FUNCTIONS = [
  { id: "engineering", label: "Engineering & IT" },
  { id: "product", label: "Product & R&D" },
  { id: "data_analytics", label: "Data & AI" },
  { id: "operations", label: "Operations" },
  { id: "finance", label: "Finance & Accounting" },
];

export function PlannerClient({ initialCities }: PlannerClientProps) {
  const searchParams = useSearchParams();

  // Read initial query parameters or defaults
  const [headcount, setHeadcount] = useState<number>(() => {
    const val = searchParams.get("headcount");
    return val ? parseInt(val, 10) || 100 : 100;
  });

  const [sqftPerSeat, setSqftPerSeat] = useState<number>(() => {
    const val = searchParams.get("sqft");
    return val ? parseInt(val, 10) || 60 : 60;
  });

  const [selectedFunctions, setSelectedFunctions] = useState<string[]>(() => {
    const val = searchParams.get("functions");
    return val ? val.split(",").filter(Boolean) : ["engineering", "operations"];
  });

  const [weights, setWeights] = useState<Record<Factor, number>>(() => ({
    talent: parseInt(searchParams.get("w_talent") ?? "35", 10),
    cost: parseInt(searchParams.get("w_cost") ?? "35", 10),
    ecosystem: parseInt(searchParams.get("w_eco") ?? "15", 10),
    incentives: parseInt(searchParams.get("w_inc") ?? "15", 10),
  }));

  const [expandedIncentives, setExpandedIncentives] = useState<Record<string, boolean>>({});

  // Sync state to URL search parameters for shareability
  useEffect(() => {
    const params = new URLSearchParams();
    params.set("headcount", headcount.toString());
    params.set("sqft", sqftPerSeat.toString());
    if (selectedFunctions.length > 0) {
      params.set("functions", selectedFunctions.join(","));
    }
    params.set("w_talent", weights.talent.toString());
    params.set("w_cost", weights.cost.toString());
    params.set("w_eco", weights.ecosystem.toString());
    params.set("w_inc", weights.incentives.toString());

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, "", newUrl);
  }, [headcount, sqftPerSeat, selectedFunctions, weights]);

  const toggleFunction = (fnId: string) => {
    setSelectedFunctions((prev) =>
      prev.includes(fnId) ? prev.filter((f) => f !== fnId) : [...prev, fnId]
    );
  };

  const handleWeightChange = (factor: Factor, val: number) => {
    setWeights((prev) => ({
      ...prev,
      [factor]: val,
    }));
  };

  // Filter applicable incentives for each city based on selected functions and headcount
  const filteredData = useMemo(() => {
    const incentivesCount: Record<string, number> = {};

    const filteredCities = initialCities.map((city) => {
      const matchingIncentives = city.applicableIncentives.filter((inc) => {
        // Headcount bounds validation
        if (inc.minHeadcount != null && headcount < inc.minHeadcount) {
          return false;
        }
        if (inc.maxHeadcount != null && headcount > inc.maxHeadcount) {
          return false;
        }

        // Functional scope overlap check:
        // Matches if any function in incentive overlaps with selectedFunctions
        // (or if selectedFunctions.length === 0 or incentive functions is null/empty)
        if (inc.functions && inc.functions.length > 0) {
          if (selectedFunctions.length > 0) {
            const hasOverlap = inc.functions.some((fn) => selectedFunctions.includes(fn));
            if (!hasOverlap) {
              return false;
            }
          }
        }

        return true;
      });

      incentivesCount[city.citySlug] = matchingIncentives.length;

      return {
        ...city,
        applicableIncentives: matchingIncentives,
      };
    });

    return {
      cities: filteredCities,
      incentives: incentivesCount,
    };
  }, [initialCities, headcount, selectedFunctions]);

  // Compute ranking using pure domain engine
  const rankingResult = useMemo(() => {
    const input: PlannerInput = {
      headcount,
      sqftPerSeat,
      functions: selectedFunctions,
      weights,
    };
    try {
      return rankCities(input, filteredData);
    } catch {
      return { ranked: [], unranked: [] };
    }
  }, [headcount, sqftPerSeat, selectedFunctions, weights, filteredData]);

  const toggleIncentiveDetails = (cityId: string) => {
    setExpandedIncentives((prev) => ({
      ...prev,
      [cityId]: !prev[cityId],
    }));
  };

  const totalWeight = weights.talent + weights.cost + weights.ecosystem + weights.incentives;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Parameters Sidebar — Modern Elevated Card */}
      <aside className="lg:col-span-4 rounded-2xl bg-surface border border-border p-6 space-y-6 shadow-elevated">
        <div className="space-y-1">
          <h2 className="text-sm font-medium tracking-tight text-text flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-accent-subtle text-accent border border-accent/20 flex items-center justify-center shrink-0">
              <Sliders className="w-4 h-4" />
            </span>
            <span>GCC Setup Parameters</span>
          </h2>
          <p className="text-xs text-text-muted mt-1 leading-relaxed">
            Adjust target capacity and strategic priorities to recalculate composite rankings.
          </p>
        </div>

        {/* Headcount Input */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <label htmlFor="headcount-input" className="font-medium text-text">
              Target Headcount
            </label>
            <span className="font-mono text-accent font-medium tabular-nums bg-accent-subtle px-2 py-0.5 rounded-md border border-accent/20 text-xs">
              {headcount} seats
            </span>
          </div>
          <input
            id="headcount-input"
            aria-label="Target Headcount"
            type="range"
            min={10}
            max={2000}
            step={10}
            value={headcount}
            onChange={(e) => setHeadcount(parseInt(e.target.value, 10) || 10)}
            className="w-full h-2 bg-surface-raised rounded-lg appearance-none cursor-pointer accent-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
          <div className="flex items-center justify-between text-[11px] text-text-muted">
            <span>10 seats</span>
            <span>2,000 seats</span>
          </div>
        </div>

        {/* Space Density Assumption */}
        <div className="space-y-2 pt-3 border-t border-border/80">
          <div className="flex items-center justify-between text-xs">
            <label htmlFor="sqft-input" className="font-medium text-text">
              Space per Seat
            </label>
            <span className="text-[10px] bg-surface-raised px-2 py-0.5 rounded-full text-text-muted border border-border font-medium">
              Assumption
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="sqft-input"
              aria-label="Space per seat assumption"
              type="number"
              min={40}
              max={120}
              value={sqftPerSeat}
              onChange={(e) => setSqftPerSeat(parseInt(e.target.value, 10) || 60)}
              className="w-20 px-2.5 py-1 text-xs border border-border rounded-lg font-mono text-text bg-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
            <span className="text-xs text-text-muted">sq ft / seat</span>
          </div>
        </div>

        {/* Functional Scope */}
        <div className="space-y-2.5 pt-3 border-t border-border/80">
          <span className="text-xs font-medium text-text block">
            Functional Scope
          </span>
          <div className="space-y-1.5">
            {ALL_FUNCTIONS.map((fn) => {
              const isChecked = selectedFunctions.includes(fn.id);
              return (
                <label
                  key={fn.id}
                  className={`flex items-center gap-2.5 text-xs text-text cursor-pointer px-2.5 py-1.5 rounded-lg border transition-all duration-150 ${
                    isChecked
                      ? "bg-accent-subtle/40 border-accent/30 text-text font-medium"
                      : "bg-surface hover:bg-surface-raised border-border text-text-muted"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleFunction(fn.id)}
                    className="rounded border-border text-accent focus:ring-accent focus:outline-none focus-visible:ring-1 focus-visible:ring-accent h-3.5 w-3.5"
                  />
                  <span>{fn.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Factor Priority Weights */}
        <div className="space-y-4 pt-3 border-t border-border/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text">
              Priority Weights
            </span>
            <span className="text-[11px] font-mono text-text-muted bg-surface-raised px-2 py-0.5 rounded-md border border-border">
              Total: {totalWeight}
            </span>
          </div>

          {/* Talent Weight */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-text flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-accent shrink-0" />
                <span>Talent Availability</span>
              </span>
              <span className="font-mono text-accent font-medium text-[11px]">{weights.talent}</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={weights.talent}
              aria-label="Talent Availability Weight"
              onChange={(e) => handleWeightChange("talent", parseInt(e.target.value, 10))}
              className="w-full h-2 bg-surface-raised rounded-lg appearance-none cursor-pointer accent-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
          </div>

          {/* Cost Weight */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-text flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-accent shrink-0" />
                <span>Cost Efficiency (Lower Rent)</span>
              </span>
              <span className="font-mono text-accent font-medium text-[11px]">{weights.cost}</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={weights.cost}
              aria-label="Cost Efficiency Weight"
              onChange={(e) => handleWeightChange("cost", parseInt(e.target.value, 10))}
              className="w-full h-2 bg-surface-raised rounded-lg appearance-none cursor-pointer accent-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
          </div>

          {/* Ecosystem Density Weight */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-text flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-accent shrink-0" />
                <span>Ecosystem Density</span>
              </span>
              <span className="font-mono text-accent font-medium text-[11px]">{weights.ecosystem}</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={weights.ecosystem}
              aria-label="Ecosystem Density Weight"
              onChange={(e) => handleWeightChange("ecosystem", parseInt(e.target.value, 10))}
              className="w-full h-2 bg-surface-raised rounded-lg appearance-none cursor-pointer accent-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
          </div>

          {/* Policy Incentives Weight */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-text flex items-center gap-1.5">
                <Landmark className="w-3.5 h-3.5 text-accent shrink-0" />
                <span>State Policy Incentives</span>
              </span>
              <span className="font-mono text-accent font-medium text-[11px]">{weights.incentives}</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={weights.incentives}
              aria-label="State Policy Incentives Weight"
              onChange={(e) => handleWeightChange("incentives", parseInt(e.target.value, 10))}
              className="w-full h-2 bg-surface-raised rounded-lg appearance-none cursor-pointer accent-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
          </div>
        </div>

        {/* ADR 006 Disclaimer Box */}
        <div className="p-3.5 bg-surface-raised/80 border border-border rounded-xl text-[11px] text-text-muted space-y-1 shadow-xs">
          <div className="flex items-center gap-1.5 font-medium text-text">
            <AlertCircle className="w-3.5 h-3.5 text-accent" />
            <span>Prototype Simulation</span>
          </div>
          <p className="leading-relaxed">
            All ranking scores and cost estimates are generated client-side from primary verified datasets. Inquiries and partner requests do not send real communications.
          </p>
        </div>
      </aside>

      {/* Main Ranking Display */}
      <section className="lg:col-span-8 space-y-6">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h2 className="text-base font-medium text-text">
              Ranked candidate cities ({rankingResult.ranked.length})
            </h2>
            <span className="text-xs text-text-muted font-medium bg-surface-raised px-2.5 py-0.5 rounded-full border border-border">
              Normalized composite score (0–100)
            </span>
          </div>

          {/* Empty state if 0 cities ranked */}
          {rankingResult.ranked.length === 0 && (
            <div className="mt-4 rounded-2xl border border-border bg-surface p-8 text-center space-y-2 shadow-subtle">
              <p className="text-xs font-medium text-text">
                No candidate cities qualify for ranking with current selections.
              </p>
              <p className="text-xs text-text-muted">
                All candidate cities are missing data for one or more selected factors. Adjust factors or view the unranked cities below.
              </p>
            </div>
          )}

          {/* Ranked City Cards */}
          <div className="mt-4 space-y-4">
            {rankingResult.ranked.map((city, idx) => (
              <div
                key={city.cityId}
                className="rounded-2xl border border-border bg-surface p-6 space-y-5 shadow-subtle hover:shadow-elevated hover:border-accent/40 transition-all duration-200 group"
              >
                {/* Header row — CRITICAL: First h3 in section MUST be city.cityName */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <span className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-primary to-teal-hover text-white flex items-center justify-center text-xs font-mono font-medium shadow-xs shrink-0">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base sm:text-lg font-medium text-text">
                          {city.cityName}
                        </h3>
                        {idx === 0 && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent-subtle text-accent border border-accent/25 inline-flex items-center gap-1 shadow-xs transform -rotate-1 hover:rotate-0 transition-transform">
                            <Sparkles className="w-3 h-3 text-accent" />
                            <span>Top Match</span>
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-text-muted capitalize">
                        {city.stateName}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-left sm:text-right">
                      <span className="text-[11px] text-text-muted block">Composite score</span>
                      <span className="text-xl font-medium font-mono text-accent tabular-nums tracking-tight">
                        {city.score.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Factor Contribution Bar */}
                <FactorBar factors={city.factors} score={city.score} />

                {/* Sourced Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-border">
                  {/* Office Rent */}
                  <div>
                    {city.rentFact ? (
                      <SourcedValue fact={city.rentFact} label="Office Lease Rent" />
                    ) : (
                      <span className="text-xs text-text-muted">No rent fact</span>
                    )}
                  </div>

                  {/* Tech Talent Pool */}
                  <div>
                    {city.talentFact ? (
                      <SourcedValue fact={city.talentFact} label="Tech Talent Pool" />
                    ) : (
                      <span className="text-xs text-text-muted">No talent fact</span>
                    )}
                  </div>

                  {/* Operating GCCs */}
                  <div>
                    <span className="text-xs text-text-muted block font-medium">Operating GCCs</span>
                    <span className="text-[15px] font-medium font-mono text-text tabular-nums">
                      {city.operatingGccCount}{" "}
                      <span className="text-xs font-sans text-text-muted font-normal">
                        in our data
                      </span>
                    </span>
                  </div>
                </div>

                {/* Estimated Monthly Office Cost Range */}
                <div className="p-3.5 bg-surface-raised border border-border rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-surface border border-border flex items-center justify-center shrink-0 text-text-muted">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-medium text-text block">
                        Estimated Monthly Office Rent
                      </span>
                      <span className="text-xs text-text-muted">
                        For {headcount} seats @ {sqftPerSeat} sq ft / seat
                      </span>
                    </div>
                  </div>
                  <div>
                    <Money
                      min={city.officeCost.min}
                      max={city.officeCost.max}
                      perMonth
                      className="text-sm font-medium"
                    />
                  </div>
                </div>

                {/* Applicable State Incentives Collapsible with Smooth CSS Grid Transition */}
                {city.incentives.length > 0 ? (
                  <div className="pt-2 border-t border-border">
                    <button
                      type="button"
                      onClick={() => toggleIncentiveDetails(city.cityId)}
                      aria-expanded={Boolean(expandedIncentives[city.cityId])}
                      className="w-full flex items-center justify-between text-xs text-text hover:text-accent font-medium py-1.5 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded-lg transition-colors group/btn"
                    >
                      <span className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-accent" />
                        <span>Applicable State Incentives ({city.incentives.length})</span>
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-text-muted transition-transform duration-200 ${
                          expandedIncentives[city.cityId] ? "rotate-180 text-accent" : ""
                        }`}
                      />
                    </button>

                    <div
                      className="accordion-grid"
                      data-expanded={Boolean(expandedIncentives[city.cityId])}
                    >
                      <div className="accordion-inner">
                        <div className="mt-2 space-y-2.5 pt-2 border-t border-border">
                          {city.incentives.map((inc) => (
                            <div
                              key={inc.id}
                              className="p-3.5 bg-surface-raised rounded-xl border border-border text-xs space-y-2 shadow-subtle"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <span className="font-medium text-text text-xs sm:text-[13px]">{inc.name}</span>
                                <span className="text-[11px] px-2 py-0.5 rounded-full border border-border bg-surface text-text-muted font-mono capitalize shrink-0">
                                  {inc.type.replace("_", " ")}
                                </span>
                              </div>
                              <p className="text-xs text-text leading-relaxed">
                                {inc.summary}
                              </p>
                              {inc.pinpoint && (
                                <div className="p-2.5 rounded-lg bg-surface border border-border/80 flex items-center gap-1.5 text-xs text-teal-primary font-medium">
                                  <FileText className="w-3.5 h-3.5 shrink-0" />
                                  <span>Pinpointed Clause: <strong className="font-semibold text-text">{inc.pinpoint}</strong></span>
                                </div>
                              )}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-text-muted pt-2 gap-1.5 border-t border-border/60">
                                <span>Source: {inc.sourceName}</span>
                                <a
                                  href={inc.sourceUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-accent hover:underline inline-flex items-center gap-1 font-medium bg-surface px-2.5 py-1 rounded-lg border border-border/80 hover:border-accent shadow-xs"
                                  title="Opens official government policy PDF directly at source"
                                >
                                  <FileText className="w-3.5 h-3.5 text-accent shrink-0" />
                                  <span>Official Policy Doc / PDF</span>
                                  <ExternalLink className="w-3 h-3 ml-0.5" />
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-border text-xs text-text-muted flex items-center gap-1.5 py-1.5">
                    <FileText className="w-3.5 h-3.5 text-text-muted opacity-60" />
                    <span>0 state incentives qualify for current criteria</span>
                  </div>
                )}

                {/* City Intro Action Footer */}
                <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                  <span className="text-xs text-text-muted">
                    {city.factors.filter((f) => f.weight > 0).length} of 4 factors weighted
                  </span>
                  <a
                    href={`/request-intro?city=${city.cityId}&headcount=${headcount}`}
                    className="inline-flex items-center gap-1.5 text-xs text-teal-primary font-medium hover:underline focus:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded-sm group"
                  >
                    <span>Request intros for {city.cityName}</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Unranked Cities Section per ADR 004 Non-Imputation */}
        {rankingResult.unranked.length > 0 && (
          <div className="pt-6 border-t border-border space-y-4">
            <div className="space-y-1">
              <h2 className="text-base font-medium text-text flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Not Ranked ({rankingResult.unranked.length})</span>
              </h2>
              <p className="text-xs text-text-muted leading-relaxed">
                The following candidate cities are excluded from ranking because one or more selected factors are missing in our verified primary research. Per{" "}
                <span className="font-medium text-text">ADR 004</span>, missing figures are never imputed with synthetic averages.
              </p>
            </div>

            <div className="space-y-3.5">
              {rankingResult.unranked.map((city) => (
                <div
                  key={city.cityId}
                  className="rounded-2xl border border-dashed border-border-strong bg-surface/80 p-5 space-y-3.5 shadow-subtle hover:border-border-stronger transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-medium text-text">
                        {city.cityName}
                      </h3>
                      <span className="text-xs text-text-muted capitalize">
                        {city.stateName}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      {city.missing.map((factor) => (
                        <span
                          key={factor}
                          className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200 font-medium"
                        >
                          Missing: {factor === "talent" ? "Tech Talent Count" : "Office Rent"}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Show available metrics honestly */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-3 border-t border-border/80">
                    {city.rentFact ? (
                      <SourcedValue fact={city.rentFact} label="Office Lease Rent" />
                    ) : (
                      <span className="text-xs text-text-muted">Office rent: Unverified</span>
                    )}

                    {city.officeCost && (
                      <div>
                        <span className="text-xs text-text-muted block">Office Cost Range</span>
                        <Money min={city.officeCost.min} max={city.officeCost.max} perMonth />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
