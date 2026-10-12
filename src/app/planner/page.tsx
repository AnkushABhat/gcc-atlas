import React, { Suspense } from "react";
import { listCities, getAllLatestFacts, listIncentives } from "../../modules/cities";
import { countOperatingByCity } from "../../modules/gccs";
import { PlannerCityData, IncentiveRef, FactRef } from "../../modules/planner/types";
import { PlannerClient } from "./planner-client";

export const metadata = {
  title: "Setup Planner — GCC Atlas",
  description: "Interactive single source of truth for planning and ranking GCC locations across India.",
};

export default async function PlannerPage() {
  const [cities, allFacts, gccCounts, allIncentives] = await Promise.all([
    listCities(),
    getAllLatestFacts(),
    countOperatingByCity(),
    listIncentives(),
  ]);

  // Assemble PlannerCityData for each city
  const plannerCities: PlannerCityData[] = cities.map((city) => {
    const cityFacts = allFacts[city.slug] ?? {};
    const rentRaw = cityFacts["office_rent_inr_sqft_month"];
    const talentRaw = cityFacts["tech_talent_count"];

    const rentFact: FactRef | null = rentRaw
      ? {
          id: rentRaw.id,
          valueMin: rentRaw.valueMin,
          valueMax: rentRaw.valueMax,
          unit: rentRaw.unit,
          sourceName: rentRaw.sourceName,
          sourceUrl: rentRaw.sourceUrl,
          asOf: rentRaw.asOf,
          confidence: rentRaw.confidence,
          note: rentRaw.note,
          pinpoint: rentRaw.pinpoint,
        }
      : null;

    const talentFact: FactRef | null = talentRaw
      ? {
          id: talentRaw.id,
          valueMin: talentRaw.valueMin,
          valueMax: talentRaw.valueMax,
          unit: talentRaw.unit,
          sourceName: talentRaw.sourceName,
          sourceUrl: talentRaw.sourceUrl,
          asOf: talentRaw.asOf,
          confidence: talentRaw.confidence,
          note: talentRaw.note,
          pinpoint: talentRaw.pinpoint,
        }
      : null;

    const cityIncentives: IncentiveRef[] = allIncentives
      .filter((inc) => inc.stateSlug === city.stateSlug)
      .map((inc) => {
        let parsedFunctions: string[] | null = null;
        if (Array.isArray(inc.functions)) {
          parsedFunctions = inc.functions;
        } else if (typeof inc.functions === "string") {
          try {
            parsedFunctions = JSON.parse(inc.functions);
          } catch {
            parsedFunctions = null;
          }
        }

        return {
          id: inc.id,
          name: inc.name,
          type: inc.type,
          summary: inc.summary,
          sourceName: inc.sourceName,
          sourceUrl: inc.sourceUrl,
          asOf: inc.asOf,
          pinpoint: inc.pinpoint ?? null,
          minHeadcount: inc.minHeadcount ?? null,
          maxHeadcount: inc.maxHeadcount ?? null,
          functions: parsedFunctions,
        };
      });

    return {
      citySlug: city.slug,
      cityName: city.name,
      stateSlug: city.stateSlug,
      stateName: city.stateName,
      rentFact,
      talentFact,
      operatingGccCount: gccCounts[city.slug] ?? 0,
      applicableIncentives: cityIncentives,
    };
  });

  return (
    <div className="relative space-y-8 py-2">
      {/* Ambient background glow */}
      <div
        className="ambient-glow-teal -top-20 -left-16 w-96 h-96 opacity-60"
        aria-hidden="true"
      />

      <div className="space-y-1.5">
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-accent-subtle text-accent border border-accent/20 text-xs font-medium">
          <span>Multi-Factor Location Modeling</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-text">
          GCC Setup Planner
        </h1>
        <p className="text-sm text-text-muted max-w-3xl leading-relaxed">
          Configure your headcount, functional scope, and strategic priorities. Candidate locations are ranked based strictly on verified public facts. Cities with missing figures are never imputed with guesses.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="max-w-7xl mx-auto px-4 py-8 text-center text-muted-foreground">
            Loading Setup Planner...
          </div>
        }
      >
        <PlannerClient initialCities={plannerCities} />
      </Suspense>
    </div>
  );
}
