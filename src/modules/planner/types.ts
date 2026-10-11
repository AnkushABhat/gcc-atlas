export type Factor = "talent" | "cost" | "ecosystem" | "incentives";

export interface Range {
  min: number;
  max: number;
}

export interface FactRef {
  id: number;
  valueMin: number;
  valueMax: number;
  unit: string;
  sourceName: string;
  sourceUrl: string;
  asOf: string;
  confidence: string;
  note?: string | null;
}

export interface IncentiveRef {
  id: number;
  name: string;
  type: string;
  summary: string;
  sourceName: string;
  sourceUrl: string;
  asOf: string;
  minHeadcount?: number | null;
  maxHeadcount?: number | null;
  functions?: string[] | null;
}

export interface PlannerCityData {
  citySlug: string;
  cityName: string;
  stateSlug: string;
  stateName: string;
  rentFact?: FactRef | null;
  talentFact?: FactRef | null;
  operatingGccCount: number;
  applicableIncentives: IncentiveRef[];
}

export interface PlannerData {
  cities: PlannerCityData[];
  incentives?: Record<string, number>;
}

export interface PlannerInput {
  headcount: number;
  functions: string[];
  sqftPerSeat?: number; // default 60
  weights: Record<Factor, number>;
  selectedFactors?: Factor[];
}

export interface FactorScore {
  factor: Factor;
  raw: number;
  normalized: number;
  weight: number;
  contribution: number;
  sourceFactIds: number[];
}

export interface CityScore {
  cityId: string;
  cityName: string;
  stateSlug: string;
  stateName: string;
  score: number; // 0 to 100
  factors: FactorScore[];
  officeCost: Range;
  incentives: IncentiveRef[];
  rentFact?: FactRef | null;
  talentFact?: FactRef | null;
  operatingGccCount: number;
}

export interface UnrankedCity {
  cityId: string;
  cityName: string;
  stateSlug: string;
  stateName: string;
  missing: Factor[];
  officeCost?: Range | null;
  incentives?: IncentiveRef[];
  rentFact?: FactRef | null;
  talentFact?: FactRef | null;
  operatingGccCount?: number;
}

export interface PlannerResult {
  ranked: CityScore[];
  unranked: UnrankedCity[];
}
