import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      message:
        "This project uses Stripe Payment Links for billing. Configure webhook delivery to /api/webhooks/stripe."
    },
    { status: 410 }
  );
}
