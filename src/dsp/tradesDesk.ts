import { DSP, DSPCPCBidResponse, Impression } from '../types.js';

export class TradesDeskDSP implements DSP {
  id = 'ttd';
  name = 'The Trade Desk';
  budget = 80;
  spent = 0;
  clicksWon = 0;
  conversionsWon = 0;
  impressionsWon: string[] = [];

  async getCPCBid(impression: Impression): Promise<DSPCPCBidResponse | null> {
    const bidPerSegment: Record<string, number> = {
      tech: 0.55,
      finance: 0.60,
      general: 0.35,
      sports: 0.30
    };

    return {
      cpcBid: bidPerSegment[impression.userSegment] || 0.25,
      dspId: this.id,
    };
  }
}
