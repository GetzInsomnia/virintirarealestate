export interface PriceBucket {
  min: number;
  max: number;
  step: number;
}

export const PRICE_BUCKETS: PriceBucket[] = [
  { min: 100_000, max: 1_000_000, step: 100_000 },
  { min: 1_000_000, max: 10_000_000, step: 1_000_000 },
  { min: 10_000_000, max: 50_000_000, step: 5_000_000 },
  { min: 50_000_000, max: 300_000_000, step: 10_000_000 },
  { min: 300_000_000, max: 1_000_000_000, step: 100_000_000 },
];

export const MIN_PRICE = PRICE_BUCKETS[0].min;
export const MAX_PRICE = PRICE_BUCKETS[PRICE_BUCKETS.length - 1].max;

export const PRICE_OPTIONS: number[] = (() => {
  const opts: number[] = [];
  for (const bucket of PRICE_BUCKETS) {
    for (let v = bucket.min; v <= bucket.max; v += bucket.step) {
      opts.push(v);
    }
  }
  return opts;
})();

const PRICE_SET = new Set(PRICE_OPTIONS);
export function isValidPrice(value: number): boolean {
  return PRICE_SET.has(value);
}
