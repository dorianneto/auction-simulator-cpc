import type { DSP, Impression, DSPCPCBidResponse } from '../types.js';

export class ProgrammaticDirectDSP implements DSP {
  id = 'prog-direct';
  name = 'Programmatic Direct';
  budget = 50;
  spent = 0;
  clicksWon = 0;
  conversionsWon = 0;
  impressionsWon: string[] = [];

  async getCPCBid(impression: Impression): Promise<DSPCPCBidResponse | null> {
    if (
      impression.location !== 'New York' &&
      impression.location !== 'San Francisco'
    ) {
      return null; // Only bid in major markets
    }

    if (impression.userSegment === 'general') {
      return { cpcBid: 0.32, dspId: this.id };
    }

    return null;
  }
}
