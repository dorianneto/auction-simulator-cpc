import { DSP, DSPCPCBidResponse, Impression } from '../types.js';

export class MagniteDSP implements DSP {
  id = 'magnite';
  name = 'Magnite';
  budget = 60;
  spent = 0;
  clicksWon = 0;
  conversionsWon = 0;
  impressionsWon: string[] = [];

  async getCPCBid(impression: Impression): Promise<DSPCPCBidResponse | null> {
    if (impression.userSegment === 'tech') {
      return null; // Magnite: finance specialist, skip tech
    }

    if (impression.userSegment === 'finance') {
      return { cpcBid: 0.65, dspId: this.id };
    }

    if (
      impression.userSegment === 'general' ||
      impression.userSegment === 'sports'
    ) {
      return { cpcBid: 0.28, dspId: this.id };
    }

    return null;
  }
}
