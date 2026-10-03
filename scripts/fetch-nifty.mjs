// Downloads daily Nifty 50 OHLC history from Stooq and writes public/data/nifty50.json
// for the "Read the chart" game. Run with: npm run data:nifty
import { writeFile } from 'node:fs/promises';

const SOURCE = 'https://stooq.com/q/d/l/?s=%5Ensei&i=d';
const YEARS = 10;
const OUT = new URL('../public/data/nifty50.json', import.meta.url);

const res = await fetch(SOURCE);
if (!res.ok) throw new Error(`Stooq responded ${res.status}`);
const csv = (await res.text()).trim();
const [header, ...lines] = csv.split(/\r?\n/);
if (!/^Date,Open,High,Low,Close/i.test(header)) {
  throw new Error(`Unexpected CSV header: ${header.slice(0, 80)}`);
}

const cutoff = new Date();
cutoff.setFullYear(cutoff.getFullYear() - YEARS);
const round = (v) => Math.round(Number(v) * 100) / 100;

const candles = lines
  .map((line) => line.split(','))
  .filter(([date, o, h, l, c]) => date && [o, h, l, c].every((v) => Number.isFinite(Number(v))))
  .filter(([date]) => new Date(date) >= cutoff)
  .map(([date, o, h, l, c]) => [date, round(o), round(h), round(l), round(c)]);

if (candles.length < 500) throw new Error(`Only ${candles.length} rows; refusing to write`);

const data = {
  symbol: 'NIFTY 50',
  source: 'Stooq (stooq.com), daily OHLC',
  updated: new Date().toISOString().slice(0, 10),
  fields: ['date', 'open', 'high', 'low', 'close'],
  candles,
};
await writeFile(OUT, JSON.stringify(data));
console.log(`Wrote ${candles.length} sessions (${candles[0][0]} → ${candles.at(-1)[0]})`);
