import { lemonSqueezySetup } from "@lemonsqueezy/lemonsqueezy.js";

let initialized = false;

export function ensureLemonSqueezyClient() {
  if (initialized) {
    return;
  }

  const apiKey = process.env.LEMONSQUEEZY_API_KEY;

  if (apiKey) {
    lemonSqueezySetup({ apiKey });
  }

  initialized = true;
}
