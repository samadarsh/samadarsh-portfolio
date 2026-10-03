// Downloads daily Nifty 50 OHLC history from Yahoo Finance and writes public/data/nifty50.json
// for the "Read the chart" game. Run with: npm run data:nifty
// (Stooq's CSV download now sits behind a JavaScript bot check, so scripts can't use it.)
import { writeFile, mkdir } from 'node:fs/promises';

const SOURCE = 'https://query1.finance.yahoo.com/v8/finance/chart/%5ENSEI?range=10y&interval=1d';
const OUT_DIR = new URL('../public/data/', import.meta.url);
const OUT = new URL('nifty50.json', OUT_DIR);

const res = await fetch(SOURCE, { headers: { 'User-Agent': 'Mozilla/5.0' } });
if (!res.ok) throw new Error(`Yahoo Finance responded ${res.status}`);
const json = await res.json();
const result = json?.chart?.result?.[0];
const quote = result?.indicators?.quote?.[0];
if (!result?.timestamp || !quote) throw new Error('Unexpected response shape');

const round = (v) => Math.round(v * 100) / 100;
// Timestamps are session opens in IST; shift by the exchange offset so the date is the IST date.
const toDate = (ts) => new Date((ts + result.meta.gmtoffset) * 1000).toISOString().slice(0, 10);

const candles = result.timestamp
  .map((ts, i) => [toDate(ts), quote.open[i], quote.high[i], quote.low[i], quote.close[i]])
  .filter(([, o, h, l, c]) => [o, h, l, c].every((v) => Number.isFinite(v) && v > 0))
  .map(([date, o, h, l, c]) => [date, round(o), round(h), round(l), round(c)]);

if (candles.length < 500) throw new Error(`Only ${candles.length} rows; refusing to write`);

const data = {
  symbol: 'NIFTY 50',
  source: 'Yahoo Finance (^NSEI), daily OHLC',
  updated: new Date().toISOString().slice(0, 10),
  fields: ['date', 'open', 'high', 'low', 'close'],
  candles,
};
await mkdir(OUT_DIR, { recursive: true });
await writeFile(OUT, JSON.stringify(data));
console.log(`Wrote ${candles.length} sessions (${candles[0][0]} → ${candles.at(-1)[0]})`);
