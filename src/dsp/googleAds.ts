import type { DSP, DSPCPCBidResponse, Impression } from '../types.js';

export class GoogleAdsDSP implements DSP {
  id = 'google-ads';
  name = 'Google Ads';
  budget = 100;
  spent = 0;
  clicksWon = 0;
  conversionsWon = 0;
  impressionsWon: string[] = [];

  async getCPCBid(impression: Impression): Promise<DSPCPCBidResponse | null> {
    if (impression.userSegment === 'tech') {
      return { cpcBid: 0.80, dspId: this.id };
    }

    if (impression.userSegment === 'finance') {
      return { cpcBid: 0.50, dspId: this.id };
    }

    if (impression.userSegment === 'general') {
      return { cpcBid: 0.25, dspId: this.id };
    }

    return null;
  }
}
