import fs from 'node:fs/promises';
import path from 'node:path';

import type { Rates } from './convert';

const ECB_URL = 'https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml';

export async function updateRates(): Promise<void> {
  try {
    const res = await fetch(ECB_URL);
    if (!res.ok) {
      throw new Error(`unexpected response ${res.status}`);
    }
    const xml = await res.text();
    const ecbRates: Record<string, number> = {};
    const regex = /currency='([A-Z]{3})'\s+rate='([0-9.]+)'/g;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(xml)) !== null) {
      const [, currency, rate] = match;
      ecbRates[currency] = parseFloat(rate);
    }
    const thbPerEur = ecbRates['THB'];
    if (!thbPerEur) {
      throw new Error('THB rate not found');
    }
    const rates: Rates = { THB: 1 };
    for (const [currency, perEur] of Object.entries(ecbRates)) {
      if (currency === 'THB') continue;
      rates[currency] = parseFloat((perEur / thbPerEur).toFixed(3));
    }
    const filePath = path.join(process.cwd(), 'public', 'data', 'rates.json');
    await fs.writeFile(filePath, JSON.stringify(rates, null, 2) + '\n');
  } catch (err) {
    console.warn('Skipping rate update:', err);
  }
}
