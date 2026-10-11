import { describe, it, expect } from "vitest";
import { rankCities, estimateOfficeCost, PlannerData, PlannerInput } from "./index";

describe("Setup Planner Domain Engine", () => {
  describe("estimateOfficeCost", () => {
    it("calculates office cost range accurately using headcount, sqftPerSeat, and rent bounds", () => {
      // 100 seats * 60 sqft = 6,000 sqft. Rent 80 to 120 -> 480,000 to 720,000 INR/month
      const cost = estimateOfficeCost(100, 60, { min: 80, max: 120 });
      expect(cost.min).toBe(480000);
      expect(cost.max).toBe(720000);
    });

    it("uses default sqftPerSeat of 60 when omitted", () => {
      const cost = estimateOfficeCost(50, undefined, { min: 100, max: 100 });
      expect(cost.min).toBe(300000);
      expect(cost.max).toBe(300000);
    });

    it("returns zero range when headcount is zero", () => {
      const cost = estimateOfficeCost(0, 60, { min: 80, max: 120 });
      expect(cost.min).toBe(0);
      expect(cost.max).toBe(0);
    });
  });

  describe("rankCities", () => {
    const inlineFixtureData: PlannerData = {
      cities: [
        {
          citySlug: "city-talent",
          cityName: "Talent City",
          stateSlug: "state-a",
          stateName: "State A",
          rentFact: {
            id: 1,
            valueMin: 140,
            valueMax: 160, // midpoint 150 (expensive)
            unit: "INR per sq ft per month",
            sourceName: "Source 1",
            sourceUrl: "https://example.com/rent1",
            asOf: "2024-01-01",
            confidence: "reported",
          },
          talentFact: {
            id: 2,
            valueMin: 1000000,
            valueMax: 1000000, // 1M (huge talent)
            unit: "people",
            sourceName: "Source 2",
            sourceUrl: "https://example.com/talent1",
            asOf: "2024-01-01",
            confidence: "reported",
          },
          operatingGccCount: 20,
          applicableIncentives: [
            {
              id: 10,
              name: "Inc 1",
              type: "power",
              summary: "Power subsidy",
              sourceName: "Gov",
              sourceUrl: "https://example.com/inc1",
              asOf: "2024-01-01",
            },
          ],
        },
        {
          citySlug: "city-cheap",
          cityName: "Budget City",
          stateSlug: "state-b",
          stateName: "State B",
          rentFact: {
            id: 3,
            valueMin: 50,
            valueMax: 50, // midpoint 50 (cheap)
            unit: "INR per sq ft per month",
            sourceName: "Source 3",
            sourceUrl: "https://example.com/rent2",
            asOf: "2024-01-01",
            confidence: "reported",
          },
          talentFact: {
            id: 4,
            valueMin: 200000,
            valueMax: 200000, // 200k (smaller talent)
            unit: "people",
            sourceName: "Source 4",
            sourceUrl: "https://example.com/talent2",
            asOf: "2024-01-01",
            confidence: "reported",
          },
          operatingGccCount: 5,
          applicableIncentives: [],
        },
        {
          citySlug: "city-incomplete",
          cityName: "Gap City",
          stateSlug: "state-c",
          stateName: "State C",
          rentFact: {
            id: 5,
            valueMin: 40,
            valueMax: 40,
            unit: "INR per sq ft per month",
            sourceName: "Source 5",
            sourceUrl: "https://example.com/rent3",
            asOf: "2024-01-01",
            confidence: "reported",
          },
          talentFact: null, // missing talent metric
          operatingGccCount: 2,
          applicableIncentives: [],
        },
      ],
    };

    it("ranks city with higher talent first when talent is weighted 100%", () => {
      const input: PlannerInput = {
        headcount: 100,
        functions: ["engineering"],
        sqftPerSeat: 60,
        weights: { talent: 10, cost: 0, ecosystem: 0, incentives: 0 },
      };

      const result = rankCities(input, inlineFixtureData);
      expect(result.ranked.length).toBe(2);
      expect(result.ranked[0]?.cityId).toBe("city-talent");
      expect(result.ranked[0]?.score).toBe(100);
      expect(result.ranked[1]?.cityId).toBe("city-cheap");
      expect(result.ranked[1]?.score).toBe(0);
    });

    it("flips ranking order when cost weight dominates (cost inversion)", () => {
      const input: PlannerInput = {
        headcount: 100,
        functions: ["engineering"],
        sqftPerSeat: 60,
        weights: { talent: 0, cost: 10, ecosystem: 0, incentives: 0 },
      };

      const result = rankCities(input, inlineFixtureData);
      expect(result.ranked.length).toBe(2);
      expect(result.ranked[0]?.cityId).toBe("city-cheap"); // Cheaper rent (50 vs 150) wins
      expect(result.ranked[0]?.score).toBe(100);
      expect(result.ranked[1]?.cityId).toBe("city-talent");
      expect(result.ranked[1]?.score).toBe(0);
    });

    it("places cities with missing selected metrics into unranked per ADR 004 non-imputation", () => {
      const input: PlannerInput = {
        headcount: 100,
        functions: ["engineering"],
        weights: { talent: 5, cost: 5, ecosystem: 0, incentives: 0 },
      };

      const result = rankCities(input, inlineFixtureData);
      expect(result.unranked.length).toBe(1);
      const unrankedCity = result.unranked[0];
      expect(unrankedCity?.cityId).toBe("city-incomplete");
      expect(unrankedCity?.cityName).toBe("Gap City");
      expect(unrankedCity?.missing).toContain("talent");
      // Office cost should still be computed if rent fact is available
      expect(unrankedCity?.officeCost?.min).toBe(240000);
    });

    it("normalizes factor to 0.5 when all ranked cities have equal metric values", () => {
      const equalData: PlannerData = {
        cities: [
          {
            citySlug: "city-1",
            cityName: "City One",
            stateSlug: "state-a",
            stateName: "State A",
            rentFact: {
              id: 1,
              valueMin: 100,
              valueMax: 100,
              unit: "INR per sq ft per month",
              sourceName: "Source",
              sourceUrl: "https://example.com/rent",
              asOf: "2024-01-01",
              confidence: "reported",
            },
            talentFact: {
              id: 2,
              valueMin: 500000,
              valueMax: 500000,
              unit: "people",
              sourceName: "Source",
              sourceUrl: "https://example.com/talent",
              asOf: "2024-01-01",
              confidence: "reported",
            },
            operatingGccCount: 10,
            applicableIncentives: [],
          },
          {
            citySlug: "city-2",
            cityName: "City Two",
            stateSlug: "state-b",
            stateName: "State B",
            rentFact: {
              id: 3,
              valueMin: 100,
              valueMax: 100,
              unit: "INR per sq ft per month",
              sourceName: "Source",
              sourceUrl: "https://example.com/rent",
              asOf: "2024-01-01",
              confidence: "reported",
            },
            talentFact: {
              id: 4,
              valueMin: 500000,
              valueMax: 500000,
              unit: "people",
              sourceName: "Source",
              sourceUrl: "https://example.com/talent",
              asOf: "2024-01-01",
              confidence: "reported",
            },
            operatingGccCount: 10,
            applicableIncentives: [],
          },
        ],
      };

      const input: PlannerInput = {
        headcount: 50,
        functions: ["engineering"],
        weights: { talent: 5, cost: 5, ecosystem: 5, incentives: 5 },
      };

      const result = rankCities(input, equalData);
      expect(result.ranked.length).toBe(2);
      expect(result.ranked[0]?.score).toBe(50);
      expect(result.ranked[1]?.score).toBe(50);
      for (const factor of result.ranked[0]?.factors ?? []) {
        expect(factor.normalized).toBe(0.5);
      }
    });

    it("breaks ties deterministically using alphabetical order by city name ascending", () => {
      const tiedData: PlannerData = {
        cities: [
          {
            citySlug: "city-z",
            cityName: "Zeta City",
            stateSlug: "state-z",
            stateName: "State Z",
            rentFact: {
              id: 1,
              valueMin: 100,
              valueMax: 100,
              unit: "INR",
              sourceName: "S",
              sourceUrl: "https://example.com",
              asOf: "2024-01-01",
              confidence: "reported",
            },
            talentFact: {
              id: 2,
              valueMin: 500000,
              valueMax: 500000,
              unit: "people",
              sourceName: "S",
              sourceUrl: "https://example.com",
              asOf: "2024-01-01",
              confidence: "reported",
            },
            operatingGccCount: 10,
            applicableIncentives: [],
          },
          {
            citySlug: "city-a",
            cityName: "Alpha City",
            stateSlug: "state-a",
            stateName: "State A",
            rentFact: {
              id: 3,
              valueMin: 100,
              valueMax: 100,
              unit: "INR",
              sourceName: "S",
              sourceUrl: "https://example.com",
              asOf: "2024-01-01",
              confidence: "reported",
            },
            talentFact: {
              id: 4,
              valueMin: 500000,
              valueMax: 500000,
              unit: "people",
              sourceName: "S",
              sourceUrl: "https://example.com",
              asOf: "2024-01-01",
              confidence: "reported",
            },
            operatingGccCount: 10,
            applicableIncentives: [],
          },
        ],
      };

      const input: PlannerInput = {
        headcount: 50,
        functions: [],
        weights: { talent: 1, cost: 1, ecosystem: 1, incentives: 1 },
      };

      const result = rankCities(input, tiedData);
      expect(result.ranked[0]?.cityName).toBe("Alpha City");
      expect(result.ranked[1]?.cityName).toBe("Zeta City");
    });

    it("throws a validation error when all active weights are zero", () => {
      const input: PlannerInput = {
        headcount: 50,
        functions: [],
        weights: { talent: 0, cost: 0, ecosystem: 0, incentives: 0 },
      };

      expect(() => rankCities(input, inlineFixtureData)).toThrow(
        "Total weight of active factors must be greater than zero"
      );
    });

    it("dynamically scores incentives factor when incentive counts or data.incentives map varies", () => {
      const incentiveTestData: PlannerData = {
        cities: [
          {
            citySlug: "city-high-inc",
            cityName: "Policy Haven",
            stateSlug: "state-a",
            stateName: "State A",
            rentFact: {
              id: 1,
              valueMin: 100,
              valueMax: 100,
              unit: "INR",
              sourceName: "S",
              sourceUrl: "https://example.com",
              asOf: "2024-01-01",
              confidence: "reported",
            },
            talentFact: {
              id: 2,
              valueMin: 500000,
              valueMax: 500000,
              unit: "people",
              sourceName: "S",
              sourceUrl: "https://example.com",
              asOf: "2024-01-01",
              confidence: "reported",
            },
            operatingGccCount: 10,
            applicableIncentives: [
              {
                id: 1,
                name: "R&D Subsidy",
                type: "capex_subsidy",
                summary: "R&D support",
                sourceName: "Gov",
                sourceUrl: "https://example.com",
                asOf: "2024-01-01",
                minHeadcount: 100,
                functions: ["engineering", "product"],
              },
              {
                id: 2,
                name: "Power Concession",
                type: "power",
                summary: "Power tariff",
                sourceName: "Gov",
                sourceUrl: "https://example.com",
                asOf: "2024-01-01",
                minHeadcount: 20,
                functions: ["operations"],
              },
            ],
          },
          {
            citySlug: "city-low-inc",
            cityName: "Policy Neutral",
            stateSlug: "state-b",
            stateName: "State B",
            rentFact: {
              id: 3,
              valueMin: 100,
              valueMax: 100,
              unit: "INR",
              sourceName: "S",
              sourceUrl: "https://example.com",
              asOf: "2024-01-01",
              confidence: "reported",
            },
            talentFact: {
              id: 4,
              valueMin: 500000,
              valueMax: 500000,
              unit: "people",
              sourceName: "S",
              sourceUrl: "https://example.com",
              asOf: "2024-01-01",
              confidence: "reported",
            },
            operatingGccCount: 10,
            applicableIncentives: [],
          },
        ],
      };

      const input: PlannerInput = {
        headcount: 150,
        functions: ["engineering"],
        weights: { talent: 0, cost: 0, ecosystem: 0, incentives: 10 },
      };

      const result = rankCities(input, incentiveTestData);
      expect(result.ranked[0]?.cityId).toBe("city-high-inc");
      expect(result.ranked[0]?.score).toBe(100);
      expect(result.ranked[1]?.cityId).toBe("city-low-inc");
      expect(result.ranked[1]?.score).toBe(0);
    });

    it("respects external data.incentives count override if provided", () => {
      const incentiveTestData: PlannerData = {
        cities: [
          {
            citySlug: "city-a",
            cityName: "City A",
            stateSlug: "state-a",
            stateName: "State A",
            rentFact: {
              id: 1,
              valueMin: 100,
              valueMax: 100,
              unit: "INR",
              sourceName: "S",
              sourceUrl: "https://example.com",
              asOf: "2024-01-01",
              confidence: "reported",
            },
            talentFact: {
              id: 2,
              valueMin: 500000,
              valueMax: 500000,
              unit: "people",
              sourceName: "S",
              sourceUrl: "https://example.com",
              asOf: "2024-01-01",
              confidence: "reported",
            },
            operatingGccCount: 10,
            applicableIncentives: [],
          },
          {
            citySlug: "city-b",
            cityName: "City B",
            stateSlug: "state-b",
            stateName: "State B",
            rentFact: {
              id: 3,
              valueMin: 100,
              valueMax: 100,
              unit: "INR",
              sourceName: "S",
              sourceUrl: "https://example.com",
              asOf: "2024-01-01",
              confidence: "reported",
            },
            talentFact: {
              id: 4,
              valueMin: 500000,
              valueMax: 500000,
              unit: "people",
              sourceName: "S",
              sourceUrl: "https://example.com",
              asOf: "2024-01-01",
              confidence: "reported",
            },
            operatingGccCount: 10,
            applicableIncentives: [],
          },
        ],
        incentives: {
          "city-a": 3,
          "city-b": 0,
        },
      };

      const input: PlannerInput = {
        headcount: 100,
        functions: ["engineering"],
        weights: { talent: 0, cost: 0, ecosystem: 0, incentives: 10 },
      };

      const result = rankCities(input, incentiveTestData);
      expect(result.ranked[0]?.cityId).toBe("city-a");
      expect(result.ranked[0]?.score).toBe(100);
      expect(result.ranked[1]?.cityId).toBe("city-b");
      expect(result.ranked[1]?.score).toBe(0);
    });
  });
});
