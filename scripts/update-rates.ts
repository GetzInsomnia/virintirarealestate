import { updateRates } from '../src/lib/fx/updateRates';

async function main(): Promise<void> {
  const { success, payload } = await updateRates();
  if (success) {
    console.log(`Updated currency rates for ${payload.date}.`);
  } else {
    console.warn(`Using fallback THB-only rates for ${payload.date}.`);
  }
}

void main();
