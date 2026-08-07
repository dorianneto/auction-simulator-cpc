import type { DSP, Impression, DSPCPCBidResponse } from '../types.js';

export class AmazonDSP implements DSP {
  id = 'amazon';
  name = 'Amazon DSP';
  budget = 70;
  spent = 0;
  clicksWon = 0;
  conversionsWon = 0;
  impressionsWon: string[] = [];

  async getCPCBid(impression: Impression): Promise<DSPCPCBidResponse | null> {
    const bidPerSegment: Record<string, number> = {
      tech: 0.35,
      finance: 0.30,
      general: 0.22,
      sports: 0.18
    };

    return {
      cpcBid: bidPerSegment[impression.userSegment] || 0.15,
      dspId: this.id,
    };
  }
}
