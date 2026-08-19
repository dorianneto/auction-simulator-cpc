import type { ClickEvent, Impression } from './types.js';

// Mock storage for tracking clicks by IP/user agent (simple version)
export const clickHistory: Map<string, ClickEvent[]> = new Map();

export function predictCTR(impression: Impression): number {
  let baseCTR = 0.02;

  if (impression.userSegment === 'tech') {
    baseCTR += 0.04; // Tech: 6% CTR (high intent)
  } else if (impression.userSegment === 'finance') {
    baseCTR += 0.035; // Finance: 5.5% CTR (high intent)
  } else if (impression.userSegment === 'sports') {
    baseCTR += 0.025; // Sports: 4.5% CTR (medium intent)
  } else if (impression.userSegment === 'general') {
    baseCTR += 0.015; // General: 3.5% CTR (low intent)
  }

  if (
    impression.location === 'New York' ||
    impression.location === 'San Francisco'
  ) {
    baseCTR += 0.01; // Major markets: 1% boost
  }

  return Math.min(baseCTR, 0.12); // Cap at 12% CTR
}

export function cpcToExpectedCPM(cpcBid: number, predictedCTR: number): number {
  return cpcBid * predictedCTR * 1000;
}
