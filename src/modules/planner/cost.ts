import { Range } from "./types";

/**
 * Estimates monthly office cost range given headcount, square footage per seat assumption, and rent range.
 * Default sqftPerSeat = 60 (standard modern IT/GCC density assumption).
 */
export function estimateOfficeCost(
  headcount: number,
  sqftPerSeat: number = 60,
  rentRange: Range
): Range {
  if (headcount <= 0) {
    return { min: 0, max: 0 };
  }
  const min = Math.round(headcount * sqftPerSeat * rentRange.min);
  const max = Math.round(headcount * sqftPerSeat * rentRange.max);
  return { min, max };
}
