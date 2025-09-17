import { updateRates } from '../src/lib/fx/updateRates';

async function main(): Promise<void> {
  try {
    await updateRates();
  } catch (err) {
    console.warn('Skipping rate update:', err);
    process.exit(0);
  }
}

void main();
