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
  ChevronUp,
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
      {/* Parameters Sidebar */}
      <aside className="lg:col-span-4 bg-surface border border-border rounded-md p-5 space-y-6">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-text flex items-center gap-2">
            <Sliders className="w-4 h-4 text-accent" />
            GCC Setup Parameters
          </h2>
          <p className="text-xs text-text-muted mt-1">
            Adjust target capacity and strategic priorities to recalculate composite rankings.
          </p>
        </div>

        {/* Headcount Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <label htmlFor="headcount-input" className="font-medium text-text">
              Target Headcount
            </label>
            <span className="font-mono text-text tabular-nums">{headcount} seats</span>
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
            className="w-full h-1.5 bg-surface-raised rounded-lg appearance-none cursor-pointer accent-[#005f60]"
          />
          <div className="flex items-center justify-between text-[11px] text-text-muted">
            <span>10 seats</span>
            <span>2,000 seats</span>
          </div>
        </div>

        {/* Space Density Assumption */}
        <div className="space-y-1.5 pt-2 border-t border-border">
          <div className="flex items-center justify-between text-xs">
            <label htmlFor="sqft-input" className="font-medium text-text">
              Space per Seat
            </label>
            <span className="text-[10px] bg-surface-raised px-1.5 py-0.5 rounded text-text-muted border border-border">
              Assumption
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="sqft-input"
              type="number"
              min={40}
              max={120}
              value={sqftPerSeat}
              onChange={(e) => setSqftPerSeat(parseInt(e.target.value, 10) || 60)}
              className="w-20 px-2 py-1 text-xs border border-border rounded-sm font-mono text-text bg-surface"
            />
            <span className="text-xs text-text-muted">sq ft / seat</span>
          </div>
        </div>

        {/* Functional Scope */}
        <div className="space-y-2 pt-2 border-t border-border">
          <span className="text-xs font-medium text-text block">
            Functional Scope
          </span>
          <div className="space-y-1.5">
            {ALL_FUNCTIONS.map((fn) => (
              <label
                key={fn.id}
                className="flex items-center gap-2 text-xs text-text cursor-pointer hover:text-accent transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedFunctions.includes(fn.id)}
                  onChange={() => toggleFunction(fn.id)}
                  className="rounded-sm border-border text-accent focus:ring-accent"
                />
                <span>{fn.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Factor Priority Weights */}
        <div className="space-y-4 pt-2 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text">
              Priority Weights
            </span>
            <span className="text-[11px] font-mono text-text-muted">
              Total: {totalWeight}
            </span>
          </div>

          {/* Talent Weight */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-text">Talent Availability</span>
              <span className="font-mono text-text-muted text-[11px]">{weights.talent}</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={weights.talent}
              aria-label="Talent Availability Weight"
              onChange={(e) => handleWeightChange("talent", parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-surface-raised rounded-lg appearance-none cursor-pointer accent-[#005f60]"
            />
          </div>

          {/* Cost Weight */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-text">Cost Efficiency (Lower Rent)</span>
              <span className="font-mono text-text-muted text-[11px]">{weights.cost}</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={weights.cost}
              aria-label="Cost Efficiency Weight"
              onChange={(e) => handleWeightChange("cost", parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-surface-raised rounded-lg appearance-none cursor-pointer accent-[#005f60]"
            />
          </div>

          {/* Ecosystem Density Weight */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-text">Ecosystem Density</span>
              <span className="font-mono text-text-muted text-[11px]">{weights.ecosystem}</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={weights.ecosystem}
              aria-label="Ecosystem Density Weight"
              onChange={(e) => handleWeightChange("ecosystem", parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-surface-raised rounded-lg appearance-none cursor-pointer accent-[#005f60]"
            />
          </div>

          {/* Policy Incentives Weight */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-text">State Policy Incentives</span>
              <span className="font-mono text-text-muted text-[11px]">{weights.incentives}</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={weights.incentives}
              aria-label="State Policy Incentives Weight"
              onChange={(e) => handleWeightChange("incentives", parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-surface-raised rounded-lg appearance-none cursor-pointer accent-[#005f60]"
            />
          </div>
        </div>

        {/* ADR 006 Disclaimer Box */}
        <div className="p-3 bg-surface-raised border border-border rounded-sm text-[11px] text-text-muted space-y-1">
          <div className="flex items-center gap-1.5 font-medium text-text">
            <AlertCircle className="w-3.5 h-3.5 text-accent" />
            Prototype Simulation
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
            <h2 className="text-base font-semibold text-text">
              Ranked Candidate Cities ({rankingResult.ranked.length})
            </h2>
            <span className="text-xs text-text-muted">
              Normalized composite score (0–100)
            </span>
          </div>

          {/* Ranked City Cards */}
          <div className="mt-4 space-y-4">
            {rankingResult.ranked.map((city, idx) => (
              <div
                key={city.cityId}
                className="bg-surface border border-border rounded-md p-5 space-y-4 hover:border-border-strong transition-colors duration-150"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-surface-raised border border-border flex items-center justify-center text-xs font-mono font-medium text-text">
                      #{idx + 1}
                    </span>
                    <div>
                      <h3 className="text-base font-semibold text-text">
                        {city.cityName}
                      </h3>
                      <span className="text-xs text-text-muted">
                        {city.stateName}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-xs text-text-muted block">Composite Score</span>
                      <span className="text-lg font-semibold font-mono text-accent tabular-nums">
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
                    <span className="text-xs text-text-muted block">Operating GCCs</span>
                    <span className="text-sm font-medium font-mono text-text tabular-nums">
                      {city.operatingGccCount}{" "}
                      <span className="text-xs font-sans text-text-muted font-normal">
                        in our data
                      </span>
                    </span>
                  </div>
                </div>

                {/* Estimated Monthly Office Cost Range */}
                <div className="p-3 bg-surface-raised border border-border rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-text-muted shrink-0" />
                    <div>
                      <span className="font-medium text-text block">
                        Estimated Monthly Office Rent
                      </span>
                      <span className="text-[11px] text-text-muted">
                        For {headcount} seats @ {sqftPerSeat} sq ft / seat
                      </span>
                    </div>
                  </div>
                  <div>
                    <Money
                      min={city.officeCost.min}
                      max={city.officeCost.max}
                      perMonth
                      className="text-sm font-semibold"
                    />
                  </div>
                </div>

                {/* Applicable State Incentives Collapsible */}
                {city.incentives.length > 0 ? (
                  <div className="pt-2 border-t border-border">
                    <button
                      type="button"
                      onClick={() => toggleIncentiveDetails(city.cityId)}
                      className="w-full flex items-center justify-between text-xs text-text hover:text-accent font-medium py-1 focus:outline-none"
                    >
                      <span className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-accent" />
                        Applicable State Incentives ({city.incentives.length})
                      </span>
                      {expandedIncentives[city.cityId] ? (
                        <ChevronUp className="w-4 h-4 text-text-muted" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-text-muted" />
                      )}
                    </button>

                    {expandedIncentives[city.cityId] && (
                      <div className="mt-2 space-y-2 pt-2 border-t border-border">
                        {city.incentives.map((inc) => (
                          <div
                            key={inc.id}
                            className="p-2.5 bg-surface-raised rounded-sm border border-border text-xs space-y-1"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-medium text-text">{inc.name}</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded border border-border bg-surface text-text-muted font-mono capitalize">
                                {inc.type.replace("_", " ")}
                              </span>
                            </div>
                            <p className="text-[11px] text-text leading-relaxed">
                              {inc.summary}
                            </p>
                            <div className="flex items-center justify-between text-[10px] text-text-muted pt-1">
                              <span>Source: {inc.sourceName}</span>
                              <a
                                href={inc.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-accent hover:underline flex items-center gap-0.5"
                              >
                                <span>Policy Doc</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="pt-2 border-t border-border text-xs text-text-muted flex items-center gap-1.5 py-1">
                    <FileText className="w-3.5 h-3.5 text-text-muted opacity-60" />
                    <span>0 state incentives qualify for current criteria</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Unranked Cities Section per ADR 004 Non-Imputation */}
        {rankingResult.unranked.length > 0 && (
          <div className="pt-6 border-t border-border space-y-4">
            <div className="space-y-1">
              <h2 className="text-base font-semibold text-text flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                Not Ranked ({rankingResult.unranked.length})
              </h2>
              <p className="text-xs text-text-muted leading-relaxed">
                The following candidate cities are excluded from ranking because one or more selected factors are missing in our verified primary research. Per{" "}
                <span className="font-medium text-text">ADR 004</span>, missing figures are never imputed with synthetic averages.
              </p>
            </div>

            <div className="space-y-3">
              {rankingResult.unranked.map((city) => (
                <div
                  key={city.cityId}
                  className="bg-surface border border-border border-dashed rounded-md p-4 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-semibold text-text">
                        {city.cityName}
                      </h3>
                      <span className="text-xs text-text-muted">
                        {city.stateName}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      {city.missing.map((factor) => (
                        <span
                          key={factor}
                          className="text-[10px] px-2 py-0.5 rounded-sm bg-amber-50 text-amber-900 border border-amber-200 font-medium"
                        >
                          Missing: {factor === "talent" ? "Tech Talent Count" : "Office Rent"}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Show available metrics honestly */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2 border-t border-border">
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
