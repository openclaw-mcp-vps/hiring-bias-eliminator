import { NextResponse } from "next/server";
import Stripe from "stripe";
import { markSessionPaid } from "@/lib/db";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "sk_test_placeholder");

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json(
      { error: "STRIPE_WEBHOOK_SECRET is not configured." },
      { status: 500 }
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  const payload = await request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    if (session.id && session.payment_status === "paid") {
      await markSessionPaid(session.id, {
        email: session.customer_details?.email ?? null,
        paidAt: new Date().toISOString(),
        amountTotal: session.amount_total ?? null,
        currency: session.currency ?? null,
        paymentLinkId:
          typeof session.payment_link === "string" ? session.payment_link : session.payment_link?.id ?? null
      });
    }
  }

  return NextResponse.json({ received: true });
}
