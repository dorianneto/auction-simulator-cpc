import { cpcToExpectedCPM, predictCTR } from './helper.js';
import type {
  DSP,
  Impression,
  AuctionResult,
  CPCBid,
  ClickEvent,
} from './types.js';
import { clickHistory } from './helper.js';
import { detectFraud } from './fraud.js';
import { simulateClick } from './click.js';

async function runCPCAuction(
  impression: Impression,
  dsps: DSP[],
): Promise<AuctionResult> {
  const predictedCTR = predictCTR(impression);

  // Step 1: Request CPC bids from all DSPs
  const bidPromises = dsps.map((dsp) =>
    dsp
      .getCPCBid(impression)
      .then((bid) => {
        if (!bid) return null;
        const expectedCPM = cpcToExpectedCPM(bid.cpcBid, predictedCTR);
        return {
          dspId: dsp.id,
          dspName: dsp.name,
          cpcBid: bid.cpcBid,
          predictedCTR,
          expectedCPM,
        };
      })
      .catch(() => null),
  );

  const bidResponses = await Promise.all(bidPromises);

  // Step 2: Filter valid bids (must meet floor price)
  const validBids: CPCBid[] = bidResponses
    .filter(
      (bid): bid is CPCBid =>
        bid !== null && bid.cpcBid >= impression.floorPrice,
    )
    .sort((a, b) => b.expectedCPM - a.expectedCPM); // Sort by expected CPM

  // Step 3: Initialize result
  let result: AuctionResult = {
    impression,
    predictedCTR,
    winnerDspId: null,
    winnerDspName: null,
    winnerCPCBid: null,
    winningExpectedCPM: null,
    allBids: validBids,
    clickSimulated: false,
    clickEvent: null,
    chargeAmount: 0,
    revenue: 0,
    timestamp: Date.now(),
  };

  // No winner? Early return
  if (validBids.length === 0) {
    return result;
  }

  // Step 4: Pick winner (second-price, but using expected CPM)
  const winner = validBids[0];
  const winnerDSP = dsps.find((d) => d.id === winner.dspId);

  if (!winnerDSP) {
    return result;
  }

  result.winnerDspId = winner.dspId;
  result.winnerDspName = winner.dspName;
  result.winnerCPCBid = winner.cpcBid;
  result.winningExpectedCPM = winner.expectedCPM;

  // Step 5: Simulate click
  const clicked = simulateClick(impression, predictedCTR);
  result.clickSimulated = clicked;

  if (!clicked) {
    // No click = no charge
    return result;
  }

  // Step 6: Create click event
  const clickId = `click-${impression.id}-${Date.now()}`;
  const ipAddress = ['192.168.1.1', '10.0.0.1', 'bot-farm-123'][
    Math.floor(Math.random() * 3)
  ];
  const userAgent = ['Mozilla/5.0', 'curl/7.0', 'bot-crawler'][
    Math.floor(Math.random() * 3)
  ];

  const clickEvent: ClickEvent = {
    id: clickId,
    impressionId: impression.id,
    dspId: winner.dspId,
    timestamp: Math.random() * 1000, // ms after impression
    ipAddress,
    userAgent,
    fraudScore: 0,
    isFraudulent: false,
    fraudReasons: [],
  };

  // Step 7: Detect fraud
  const fraudAnalysis = detectFraud(clickEvent, impression, winner.dspId);
  clickEvent.fraudScore = fraudAnalysis.fraudScore;
  clickEvent.isFraudulent = fraudAnalysis.isFraudulent;
  clickEvent.fraudReasons = fraudAnalysis.reasons;

  // Record this click
  const key = `${clickEvent.ipAddress}:${clickEvent.userAgent}`;
  if (!clickHistory.has(key)) {
    clickHistory.set(key, []);
  }
  clickHistory.get(key)!.push(clickEvent);

  result.clickEvent = clickEvent;

  // Step 8: Charge (only if not fraudulent)
  if (!clickEvent.isFraudulent) {
    const chargeAmount = winner.cpcBid;
    result.chargeAmount = chargeAmount;
    result.revenue = chargeAmount;
    winnerDSP.spent += chargeAmount;
    winnerDSP.clicksWon++;
  } else {
    // Fraud detected: don't charge
    result.chargeAmount = 0;
    result.revenue = 0;
  }

  winnerDSP.impressionsWon.push(impression.id);

  return result;
}

export async function simulateCPCAuctions(
  impressions: Impression[],
  dsps: DSP[],
): Promise<AuctionResult[]> {
  const results: AuctionResult[] = [];

  for (const impression of impressions) {
    const result = await runCPCAuction(impression, dsps);
    results.push(result);
  }

  return results;
}
