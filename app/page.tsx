import Link from "next/link";
import { cookies } from "next/headers";
import { ArrowRight, CheckCircle2, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const faqs = [
  {
    q: "What does the scanner detect?",
    a: "It flags gender-coded, age-coded, exclusionary, and overly subjective phrasing in job descriptions and interview notes, then suggests neutral alternatives."
  },
  {
    q: "How accurate is the analysis?",
    a: "The model is tuned for practical HR writing edits, but final decisions should follow your internal rubric and legal review standards."
  },
  {
    q: "Do you store our hiring text?",
    a: "Submitted text is processed for analysis only. Access management is stored as payment session records and short-lived access tokens."
  },
  {
    q: "How does access unlock after payment?",
    a: "Stripe sends a checkout completion event to your webhook, then you verify the returned session ID on the success page to set your access cookie."
  }
];

export default async function LandingPage() {
  const cookieStore = await cookies();
  const hasAccess = Boolean(cookieStore.get("hbe_access")?.value);
  const paymentLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK;

  return (
    <main className="mx-auto max-w-6xl px-5 pb-24 pt-8 md:px-8">
      <header className="fade-up mb-16 rounded-2xl border border-slate-800/90 bg-slate-900/70 p-8 md:p-12">
        <p className="mb-3 inline-flex rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
          Hiring Bias Eliminator
        </p>
        <h1
          className="max-w-4xl text-3xl font-semibold leading-tight text-slate-50 md:text-5xl"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Remove bias from job descriptions and interview notes before it becomes a legal risk.
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-relaxed text-slate-300 md:text-lg">
          Hiring Bias Eliminator scans your hiring language in seconds, highlights problematic phrasing,
          and gives neutral rewrites your recruiters can use immediately.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a href={paymentLink} target="_blank" rel="noreferrer">
            <Button size="lg" className="min-w-44">
              Start for $15/month
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </a>
          <Link href={hasAccess ? "/dashboard" : "/checkout/success"}>
            <Button size="lg" variant="secondary" className="min-w-44">
              {hasAccess ? "Open Dashboard" : "I already paid"}
            </Button>
          </Link>
        </div>
        <p className="mt-4 text-xs text-slate-500">
          HR teams at 10+ employee companies use this to enforce fair language standards across recruiting.
        </p>
      </header>

      <section className="mb-16 grid gap-4 md:grid-cols-3">
        <Card className="fade-up">
          <CardHeader>
            <CardTitle className="text-slate-100">$125M in annual risk exposure</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-300">
              Discriminatory wording in interviews and job ads contributes to bias-related claims and
              expensive remediation.
            </p>
          </CardContent>
        </Card>
        <Card className="fade-up" style={{ animationDelay: "90ms" }}>
          <CardHeader>
            <CardTitle className="text-slate-100">Manual review does not scale</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-300">
              Recruiters move fast. Policy training alone is not enough to catch biased language every
              time.
            </p>
          </CardContent>
        </Card>
        <Card className="fade-up" style={{ animationDelay: "180ms" }}>
          <CardHeader>
            <CardTitle className="text-slate-100">Consistency wins audits</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-300">
              Standardized, neutral language improves fairness, candidate trust, and defensibility.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="mb-16 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-100">
              <Sparkles className="h-5 w-5 text-cyan-300" />
              What the tool does
            </CardTitle>
            <CardDescription>Built for HR and hiring managers who need immediate edits.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-300">
            <p className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
              Scans pasted text or uploaded PDF/DOCX/TXT files.
            </p>
            <p className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
              Highlights risky phrases inline with severity and reason.
            </p>
            <p className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
              Generates a neutralized draft your team can publish faster.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-100">
              <Shield className="h-5 w-5 text-cyan-300" />
              Deployment checklist
            </CardTitle>
            <CardDescription>Configure once, then share with your recruiting team.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-300">
            <p>1. Set your Stripe Payment Link with a redirect URL ending in:</p>
            <p className="rounded-md border border-slate-700 bg-slate-950 p-2 font-mono text-xs text-cyan-200">
              /checkout/success?session_id={"{CHECKOUT_SESSION_ID}"}
            </p>
            <p>2. Point Stripe webhook to `/api/webhooks/stripe` with `checkout.session.completed`.</p>
            <p>3. Add `OPENAI_API_KEY` to enable model-based analysis.</p>
          </CardContent>
        </Card>
      </section>

      <section className="mb-16">
        <Card>
          <CardHeader>
            <CardTitle className="text-slate-100">Simple Pricing</CardTitle>
            <CardDescription>One plan for small and mid-size hiring teams.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-4xl font-semibold text-slate-50">$15<span className="text-lg text-slate-400">/month</span></p>
              <p className="mt-2 text-sm text-slate-300">
                Unlimited scans, upload support, bias highlighting, rewrite suggestions, and dashboard access.
              </p>
            </div>
            <a href={paymentLink} target="_blank" rel="noreferrer">
              <Button size="lg">Buy Now</Button>
            </a>
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="mb-5 text-2xl font-semibold text-slate-100" style={{ fontFamily: "var(--font-heading)" }}>
          FAQ
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {faqs.map((item) => (
            <Card key={item.q}>
              <CardHeader>
                <CardTitle className="text-base text-slate-100">{item.q}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-300">{item.a}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
