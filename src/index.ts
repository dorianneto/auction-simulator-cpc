import { GoogleAdsDSP } from './dsp/googleAds.js';
import { TradesDeskDSP } from './dsp/tradesDesk.js';
import { MagniteDSP } from './dsp/magnite.js';
import { AmazonDSP } from './dsp/amazon.js';
import { DSP } from './types.js';
import { mockImpressions } from './impressions.js';
import { simulateCPCAuctions } from './exchange.js';
import { ProgrammaticDirectDSP } from './dsp/programmaticDirect.js';

const dsps: DSP[] = [
  new GoogleAdsDSP(),
  new TradesDeskDSP(),
  new MagniteDSP(),
  new AmazonDSP(),
  new ProgrammaticDirectDSP(),
];

simulateCPCAuctions(mockImpressions, dsps)
  .then((results) => {
    console.log('Auction Results:', results);
  })
  .catch((error) => {
    console.error('Error during auction simulation:', error);
  });
