import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createAccessToken, isPaidSession } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { sessionId?: string };
    const sessionId = body.sessionId?.trim();

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId." }, { status: 400 });
    }

    const paid = await isPaidSession(sessionId);

    if (!paid) {
      return NextResponse.json(
        {
          error:
            "Payment is not verified yet. Ensure Stripe webhook delivery succeeded, then retry in a few seconds."
        },
        { status: 403 }
      );
    }

    const accessToken = await createAccessToken(sessionId);
    const cookieStore = await cookies();

    cookieStore.set("hbe_access", accessToken, {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not grant access.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
