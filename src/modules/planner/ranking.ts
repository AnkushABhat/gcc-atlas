import {
  Factor,
  PlannerInput,
  PlannerData,
  PlannerResult,
  CityScore,
  UnrankedCity,
  FactorScore,
  PlannerCityData,
} from "./types";
import { estimateOfficeCost } from "./cost";

const ALL_FACTORS: Factor[] = ["talent", "cost", "ecosystem", "incentives"];

function getRawFactorValue(city: PlannerCityData, factor: Factor, incentivesMap?: Record<string, number>): number {
  switch (factor) {
    case "talent":
      if (!city.talentFact) return 0;
      return (city.talentFact.valueMin + city.talentFact.valueMax) / 2;
    case "cost":
      if (!city.rentFact) return 0;
      return (city.rentFact.valueMin + city.rentFact.valueMax) / 2;
    case "ecosystem":
      return city.operatingGccCount ?? 0;
    case "incentives": {
      const count = incentivesMap?.[city.citySlug];
      if (count !== undefined) {
        return count;
      }
      return city.applicableIncentives ? city.applicableIncentives.length : 0;
    }
  }
}

function getSourceFactIds(city: PlannerCityData, factor: Factor): number[] {
  switch (factor) {
    case "talent":
      return city.talentFact ? [city.talentFact.id] : [];
    case "cost":
      return city.rentFact ? [city.rentFact.id] : [];
    case "ecosystem":
      return [];
    case "incentives":
      return city.applicableIncentives ? city.applicableIncentives.map((i) => i.id) : [];
  }
}

export function rankCities(input: PlannerInput, data: PlannerData): PlannerResult {
  const factorsToUse: Factor[] =
    input.selectedFactors && input.selectedFactors.length > 0
      ? input.selectedFactors
      : ALL_FACTORS;

  // Weight validation: sum of active factor weights must be > 0
  const totalWeight = factorsToUse.reduce((sum, f) => sum + (input.weights[f] ?? 0), 0);
  if (totalWeight <= 0) {
    throw new Error("Total weight of active factors must be greater than zero");
  }

  const rankedCandidates: PlannerCityData[] = [];
  const unranked: UnrankedCity[] = [];

  for (const city of data.cities) {
    const missing: Factor[] = [];

    for (const factor of factorsToUse) {
      if (factor === "talent" && !city.talentFact) {
        missing.push("talent");
      }
      if (factor === "cost" && !city.rentFact) {
        missing.push("cost");
      }
    }

    const officeCost = city.rentFact
      ? estimateOfficeCost(input.headcount, input.sqftPerSeat ?? 60, {
          min: city.rentFact.valueMin,
          max: city.rentFact.valueMax,
        })
      : null;

    if (missing.length > 0) {
      unranked.push({
        cityId: city.citySlug,
        cityName: city.cityName,
        stateSlug: city.stateSlug,
        stateName: city.stateName,
        missing,
        officeCost,
        incentives: city.applicableIncentives,
        rentFact: city.rentFact,
        talentFact: city.talentFact,
        operatingGccCount: city.operatingGccCount,
      });
    } else {
      rankedCandidates.push(city);
    }
  }

  // Calculate min-max bounds strictly across ranked candidates per factor (ADR 004)
  const factorBounds: Record<Factor, { min: number; max: number }> = {
    talent: { min: Infinity, max: -Infinity },
    cost: { min: Infinity, max: -Infinity },
    ecosystem: { min: Infinity, max: -Infinity },
    incentives: { min: Infinity, max: -Infinity },
  };

  for (const factor of factorsToUse) {
    for (const city of rankedCandidates) {
      const val = getRawFactorValue(city, factor, data.incentives);
      if (val < factorBounds[factor].min) factorBounds[factor].min = val;
      if (val > factorBounds[factor].max) factorBounds[factor].max = val;
    }
  }

  const ranked: CityScore[] = rankedCandidates.map((city) => {
    let compositeScore = 0;
    const factorScores: FactorScore[] = [];

    for (const factor of factorsToUse) {
      const raw = getRawFactorValue(city, factor, data.incentives);
      const bounds = factorBounds[factor];
      let normalized = 0.5;

      if (bounds.max > bounds.min) {
        if (factor === "cost") {
          // Inverted: lower rent is better
          normalized = (bounds.max - raw) / (bounds.max - bounds.min);
        } else {
          // Higher is better
          normalized = (raw - bounds.min) / (bounds.max - bounds.min);
        }
      } else {
        // Equal values across all ranked cities give 0.5
        normalized = 0.5;
      }

      const weight = (input.weights[factor] ?? 0) / totalWeight;
      const contribution = weight * normalized * 100;
      compositeScore += contribution;

      factorScores.push({
        factor,
        raw,
        normalized: Math.round(normalized * 1000) / 1000,
        weight: Math.round(weight * 1000) / 1000,
        contribution: Math.round(contribution * 10) / 10,
        sourceFactIds: getSourceFactIds(city, factor),
      });
    }

    const officeCost = city.rentFact
      ? estimateOfficeCost(input.headcount, input.sqftPerSeat ?? 60, {
          min: city.rentFact.valueMin,
          max: city.rentFact.valueMax,
        })
      : { min: 0, max: 0 };

    return {
      cityId: city.citySlug,
      cityName: city.cityName,
      stateSlug: city.stateSlug,
      stateName: city.stateName,
      score: Math.round(compositeScore * 10) / 10,
      factors: factorScores,
      officeCost,
      incentives: city.applicableIncentives,
      rentFact: city.rentFact,
      talentFact: city.talentFact,
      operatingGccCount: city.operatingGccCount,
    };
  });

  // Sort ranked cities by composite score desc, breaking ties deterministically by cityName asc
  ranked.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.cityName.localeCompare(b.cityName);
  });

  // Sort unranked cities deterministically by cityName asc
  unranked.sort((a, b) => a.cityName.localeCompare(b.cityName));

  return { ranked, unranked };
}
