import type { Impression } from './types.js';

export function simulateClick(impression: Impression, ctr: number): boolean {
  // Random chance of click based on predicted CTR
  return Math.random() < ctr;
}
