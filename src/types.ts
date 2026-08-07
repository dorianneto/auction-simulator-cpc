export interface Impression {
  id: string;
  publisherId: string;
  slotSize: '300x250' | '728x90' | '160x600';
  userSegment: 'tech' | 'finance' | 'general' | 'sports';
  location: string;
  floorPrice: number; // Floor in CPC terms (minimum $ per click)
}

export interface DSPCPCBidResponse {
  cpcBid: number; // Cost per click, not CPM
  dspId: string;
}

export interface DSP {
  id: string;
  name: string;
  budget: number;
  spent: number;
  clicksWon: number;
  conversionsWon: number;
  impressionsWon: string[];
  getCPCBid(impression: Impression): Promise<DSPCPCBidResponse | null>;
}

interface CPCBid {
  dspId: string;
  dspName: string;
  cpcBid: number;
  predictedCTR: number;
  expectedCPM: number; // For auction comparison
}

interface ClickEvent {
  id: string;
  impressionId: string;
  dspId: string;
  timestamp: number;
  ipAddress: string;
  userAgent: string;
  fraudScore: number; // 0-100, higher = more likely fraud
  isFraudulent: boolean;
  fraudReasons: string[];
}

interface AuctionResult {
  impression: Impression;
  predictedCTR: number;
  winnerDspId: string | null;
  winnerDspName: string | null;
  winnerCPCBid: number | null;
  winningExpectedCPM: number | null;
  allBids: CPCBid[];
  clickSimulated: boolean;
  clickEvent: ClickEvent | null;
  chargeAmount: number; // 0 if no click or fraud detected
  revenue: number; // Negative if refunded due to fraud dispute
  timestamp: number;
}

interface FraudDispute {
  clickId: string;
  impressionId: string;
  dspId: string;
  reason: string;
  refundAmount: number;
  status: 'pending' | 'approved' | 'rejected';
}
