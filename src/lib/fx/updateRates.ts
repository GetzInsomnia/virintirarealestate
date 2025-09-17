import fs from 'node:fs/promises';
import path from 'node:path';

import type { RatesPayload, Rates } from './convert';

const ECB_URL = 'https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml';
const SUPPORTED_CURRENCIES = ['THB', 'USD', 'CNY', 'EUR', 'JPY', 'SGD', 'HKD'] as const;

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function createFallbackRates(): RatesPayload {
  return {
    base: 'THB',
    date: getToday(),
    rates: {
      THB: 1,
    },
  };
}

function parseEcbRates(xml: string): RatesPayload | undefined {
  const ecbRates: Record<string, number> = {};
  const regex = /currency='([A-Z]{3})'\s+rate='([0-9.]+)'/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(xml)) !== null) {
    const [, currency, rate] = match;
    ecbRates[currency] = parseFloat(rate);
  }

  const thbPerEur = ecbRates['THB'];
  if (!thbPerEur) {
    return undefined;
  }

  const dateMatch = xml.match(/time='(\d{4}-\d{2}-\d{2})'/);
  const date = dateMatch?.[1] ?? getToday();
  const rates: Rates = { THB: 1 };

  for (const currency of SUPPORTED_CURRENCIES) {
    if (currency === 'THB') continue;

    if (currency === 'EUR') {
      rates[currency] = parseFloat((1 / thbPerEur).toFixed(6));
      continue;
    }

    const perEur = ecbRates[currency];
    if (!perEur) {
      continue;
    }
    rates[currency] = parseFloat((perEur / thbPerEur).toFixed(6));
  }

  return {
    base: 'THB',
    date,
    rates,
  };
}

async function writeRatesFile(payload: RatesPayload): Promise<void> {
  const filePath = path.join(process.cwd(), 'public', 'data', 'rates.json');
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(payload, null, 2) + '\n');
}

export interface UpdateRatesResult {
  success: boolean;
  payload: RatesPayload;
}

export async function updateRates(): Promise<UpdateRatesResult> {
  const fallback = createFallbackRates();
  try {
    const res = await fetch(ECB_URL);
    if (!res.ok) {
      throw new Error(`unexpected response ${res.status}`);
    }
    const xml = await res.text();
    const payload = parseEcbRates(xml);
    if (!payload) {
      throw new Error('Required THB rate not found in ECB response');
    }
    await writeRatesFile(payload);
    return { success: true, payload };
  } catch (err) {
    console.warn('Skipping live rate update, using fallback THB-only rates:', err);
    await writeRatesFile(fallback);
    return { success: false, payload: fallback };
  }
}

export { SUPPORTED_CURRENCIES };
