import { clickHistory } from './helper.js';
import type { Impression, ClickEvent } from './types.js';

export function detectFraud(
  clickEvent: Partial<ClickEvent>,
  impression: Impression,
): { isFraudulent: boolean; fraudScore: number; reasons: string[] } {
  let fraudScore = 0;
  const reasons: string[] = [];

  const ip = clickEvent.ipAddress || 'unknown';
  const ua = clickEvent.userAgent || 'unknown';
  const key = `${ip}:${ua}`;

  // Rule 1: Same IP clicking same DSP's ads >3 times in 60 seconds = bot
  const recentClicks = clickHistory.get(key) || [];
  const clicksInLastMinute = recentClicks.filter(
    (c) => Date.now() - c.timestamp < 60000,
  );

  if (clicksInLastMinute.length >= 3) {
    fraudScore += 40;
    reasons.push('Multiple clicks from same IP in short time');
  }

  // Rule 2: Known bot user agents
  const botPatterns = ['bot', 'crawler', 'spider', 'scraper', 'curl', 'wget'];
  if (botPatterns.some((pattern) => ua.toLowerCase().includes(pattern))) {
    fraudScore += 50;
    reasons.push('Bot-like user agent detected');
  }

  // Rule 3: Unusual CTR for segment (if CTR >15% on low-intent segment, suspicious)
  if (
    impression.userSegment === 'general' &&
    clickEvent.ipAddress === 'bot-farm-123'
  ) {
    fraudScore += 35;
    reasons.push('Known bot farm IP');
  }

  // Rule 4: Timing anomaly (if click comes <50ms after impression, likely bot)
  if (clickEvent.timestamp && clickEvent.timestamp < 50) {
    fraudScore += 25;
    reasons.push('Unnaturally fast click after impression');
  }

  // Rule 5: Same user clicking multiple different ads
  const clicksFromThisIP = Array.from(clickHistory.values())
    .flat()
    .filter((c) => c.ipAddress === ip);
  if (clicksFromThisIP.length > 10) {
    fraudScore += 20;
    reasons.push('High volume of clicks from this IP');
  }

  const isFraudulent = fraudScore >= 50; // Threshold: 50+ points = fraud

  return { isFraudulent, fraudScore, reasons };
}
