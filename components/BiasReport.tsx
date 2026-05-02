import { AlertTriangle, CheckCircle2, Scale } from "lucide-react";
import type { BiasAnalysisResult, BiasFinding } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type BiasReportProps = {
  report: BiasAnalysisResult;
  sourceText: string;
};

function severityStyles(severity: BiasFinding["severity"]): string {
  if (severity === "high") return "border-rose-400/50 bg-rose-500/10 text-rose-200";
  if (severity === "medium") return "border-amber-400/50 bg-amber-500/10 text-amber-200";
  return "border-emerald-400/50 bg-emerald-500/10 text-emerald-200";
}

function riskLabel(score: number): string {
  if (score >= 70) return "High";
  if (score >= 40) return "Moderate";
  return "Low";
}

function renderHighlightedSource(text: string, findings: BiasFinding[]) {
  const validFindings = findings
    .filter((finding) => finding.startIndex >= 0 && finding.endIndex > finding.startIndex)
    .sort((a, b) => a.startIndex - b.startIndex);

  if (validFindings.length === 0) {
    return <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-300">{text}</p>;
  }

  const nodes: React.ReactNode[] = [];
  let cursor = 0;

  for (let i = 0; i < validFindings.length; i += 1) {
    const finding = validFindings[i];
    if (finding.startIndex < cursor || finding.endIndex > text.length) {
      continue;
    }

    const before = text.slice(cursor, finding.startIndex);
    const highlighted = text.slice(finding.startIndex, finding.endIndex);

    if (before) {
      nodes.push(
        <span key={`before-${i}`} className="text-slate-300">
          {before}
        </span>
      );
    }

    nodes.push(
      <mark
        key={`highlight-${i}`}
        className="rounded bg-rose-500/30 px-0.5 text-rose-100 ring-1 ring-rose-400/40"
      >
        {highlighted}
      </mark>
    );

    cursor = finding.endIndex;
  }

  const tail = text.slice(cursor);
  if (tail) {
    nodes.push(
      <span key="tail" className="text-slate-300">
        {tail}
      </span>
    );
  }

  return <p className="whitespace-pre-wrap text-sm leading-relaxed">{nodes}</p>;
}

export function BiasReport({ report, sourceText }: BiasReportProps) {
  const risk = report.riskScore;
  const label = riskLabel(risk);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div>
            <CardTitle className="text-slate-100">Bias Risk Summary</CardTitle>
            <CardDescription>{report.summary}</CardDescription>
          </div>
          <Badge
            className={`border px-3 py-1 text-sm ${
              label === "High"
                ? "border-rose-500/50 bg-rose-500/15 text-rose-200"
                : label === "Moderate"
                  ? "border-amber-500/50 bg-amber-500/15 text-amber-200"
                  : "border-emerald-500/50 bg-emerald-500/15 text-emerald-200"
            }`}
          >
            {risk}% {label}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
              <span>Estimated bias risk</span>
              <span>{risk}%</span>
            </div>
            <div className="h-2 rounded-full bg-slate-800">
              <div
                className={`h-full rounded-full transition-all ${
                  label === "High"
                    ? "bg-rose-400"
                    : label === "Moderate"
                      ? "bg-amber-400"
                      : "bg-emerald-400"
                }`}
                style={{ width: `${risk}%` }}
              />
            </div>
          </div>

          <div className="rounded-lg border border-slate-700 bg-slate-950/60 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-200">
              <Scale className="h-4 w-4 text-cyan-300" />
              Legal/Compliance note
            </div>
            <p className="text-sm text-slate-300">{report.legalNote}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-slate-100">Highlighted Text</CardTitle>
          <CardDescription>Potentially biased phrases are marked inline.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-slate-700 bg-slate-950/60 p-4">
            {renderHighlightedSource(sourceText, report.findings)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-slate-100">Suggested Rewrites</CardTitle>
          <CardDescription>
            Replace subjective or exclusionary terms with clear, skills-based wording.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {report.findings.length === 0 ? (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
              <div className="mb-1 flex items-center gap-2 font-medium">
                <CheckCircle2 className="h-4 w-4" />
                No high-risk language found
              </div>
              The text already uses mostly neutral, role-focused language.
            </div>
          ) : (
            report.findings.map((finding) => (
              <div key={finding.id} className="rounded-lg border border-slate-700 bg-slate-950/60 p-4">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-100">{finding.category}</p>
                  <Badge className={`border capitalize ${severityStyles(finding.severity)}`}>
                    {finding.severity}
                  </Badge>
                </div>
                <p className="mb-2 text-sm text-slate-300">
                  <span className="text-slate-400">Original:</span> “{finding.snippet}”
                </p>
                <p className="mb-2 text-sm text-slate-300">
                  <span className="text-slate-400">Why it matters:</span> {finding.reason}
                </p>
                <p className="text-sm text-cyan-200">
                  <span className="text-slate-400">Use instead:</span> {finding.suggestion}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-slate-100">Neutralized Draft</CardTitle>
          <CardDescription>
            Start from this revision, then adjust to your team’s competencies and rubric language.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded-lg border border-slate-700 bg-slate-950/70 p-4 text-sm text-slate-200">
            {report.normalizedText}
          </pre>
        </CardContent>
      </Card>

      {report.riskScore >= 60 ? (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
          <p className="mb-1 flex items-center gap-2 font-medium">
            <AlertTriangle className="h-4 w-4" />
            Escalation recommended
          </p>
          Route this draft through HR or legal review before publishing or attaching it to a hiring decision.
        </div>
      ) : null}
    </div>
  );
}
