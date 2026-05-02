"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type PurchaseGateProps = {
  sessionId?: string;
};

export function PurchaseGate({ sessionId }: PurchaseGateProps) {
  const router = useRouter();
  const [isClaiming, setIsClaiming] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState(
    sessionId
      ? "Ready to verify your purchase and unlock the analyzer dashboard."
      : "No Stripe session ID was detected. Add ?session_id={CHECKOUT_SESSION_ID} to your Stripe redirect URL."
  );

  async function handleClaimAccess() {
    if (!sessionId) {
      setStatus("error");
      setMessage("Missing session ID from Stripe redirect URL.");
      return;
    }

    setIsClaiming(true);
    setStatus("idle");

    try {
      const response = await fetch("/api/access/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId })
      });

      const payload = (await response.json()) as { ok?: boolean; error?: string };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? "Could not verify this purchase yet.");
      }

      setStatus("success");
      setMessage("Access granted. Redirecting to your dashboard...");
      setTimeout(() => {
        router.push("/dashboard");
      }, 700);
    } catch (error) {
      const text = error instanceof Error ? error.message : "Unable to claim access.";
      setStatus("error");
      setMessage(text);
    } finally {
      setIsClaiming(false);
    }
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle className="text-slate-100">Complete Purchase Verification</CardTitle>
        <CardDescription>
          This step sets your secure access cookie after Stripe confirms payment.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className={`rounded-lg border p-3 text-sm ${
            status === "success"
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
              : status === "error"
                ? "border-rose-500/40 bg-rose-500/10 text-rose-200"
                : "border-slate-700 bg-slate-900/70 text-slate-300"
          }`}
        >
          <p className="flex items-center gap-2 font-medium">
            {status === "success" ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : status === "error" ? (
              <ShieldX className="h-4 w-4" />
            ) : null}
            {message}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={handleClaimAccess} disabled={isClaiming || !sessionId}>
            {isClaiming ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying
              </>
            ) : (
              "Unlock Dashboard"
            )}
          </Button>
          <Button variant="secondary" onClick={() => router.push("/")}>
            Back to landing page
          </Button>
        </div>

        {sessionId ? (
          <p className="text-xs font-mono text-slate-500">Stripe session: {sessionId}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
