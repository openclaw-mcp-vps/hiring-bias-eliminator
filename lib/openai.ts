import OpenAI from "openai";
import type { BiasAnalysisResult, BiasFinding } from "@/lib/types";

const MODEL = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";
const client = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

type BiasRule = {
  pattern: RegExp;
  category: string;
  reason: string;
  suggestion: string;
  severity: BiasFinding["severity"];
};

const BIAS_RULES: BiasRule[] = [
  {
    pattern: /\bninja\b/gi,
    category: "Age-coded jargon",
    reason: "Slang can signal a narrow culture fit and discourage broad applicant pools.",
    suggestion: "specialist",
    severity: "medium"
  },
  {
    pattern: /\brockstar\b/gi,
    category: "Gendered competitiveness",
    reason: "Aggressive superhero metaphors tend to reduce application rates from underrepresented groups.",
    suggestion: "high-performing",
    severity: "medium"
  },
  {
    pattern: /\baggressive\b/gi,
    category: "Masculine-coded language",
    reason: "Overly aggressive descriptors can suppress applicant diversity.",
    suggestion: "proactive",
    severity: "medium"
  },
  {
    pattern: /\byoung\b/gi,
    category: "Age bias",
    reason: "Age qualifiers create legal risk and imply exclusion.",
    suggestion: "early-career or experienced",
    severity: "high"
  },
  {
    pattern: /\bnative english\b/gi,
    category: "Nationality bias",
    reason: "This can exclude qualified multilingual candidates.",
    suggestion: "strong written and spoken English",
    severity: "high"
  },
  {
    pattern: /\bcultural fit\b/gi,
    category: "Subjective screening",
    reason: "Vague fit language is often linked with inconsistent interview standards.",
    suggestion: "alignment with role responsibilities and team behaviors",
    severity: "medium"
  },
  {
    pattern: /\bhe\/?she\b/gi,
    category: "Gendered pronouns",
    reason: "Binary pronouns reduce inclusion and are unnecessary in most job descriptions.",
    suggestion: "they",
    severity: "low"
  },
  {
    pattern: /\bmanpower\b/gi,
    category: "Gendered terminology",
    reason: "Gendered nouns can signal exclusionary wording.",
    suggestion: "workforce",
    severity: "medium"
  }
];

function clampRisk(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function buildNormalizedText(text: string, findings: BiasFinding[]): string {
  if (findings.length === 0) {
    return text;
  }

  let normalized = text;
  const sorted = [...findings].sort((a, b) => b.startIndex - a.startIndex);

  for (const finding of sorted) {
    if (finding.startIndex >= 0 && finding.endIndex > finding.startIndex) {
      normalized =
        normalized.slice(0, finding.startIndex) +
        finding.suggestion +
        normalized.slice(finding.endIndex);
    }
  }

  return normalized;
}

function heuristicAnalysis(text: string): BiasAnalysisResult {
  const findings: BiasFinding[] = [];

  for (const rule of BIAS_RULES) {
    for (const match of text.matchAll(rule.pattern)) {
      const snippet = match[0];
      const startIndex = match.index ?? -1;
      const endIndex = startIndex >= 0 ? startIndex + snippet.length : -1;

      findings.push({
        id: `${rule.category}-${findings.length + 1}`,
        category: rule.category,
        severity: rule.severity,
        snippet,
        reason: rule.reason,
        suggestion: rule.suggestion,
        startIndex,
        endIndex
      });
    }
  }

  const weightedScore = findings.reduce((total, finding) => {
    const impact = finding.severity === "high" ? 24 : finding.severity === "medium" ? 14 : 7;
    return total + impact;
  }, 0);

  const riskScore = clampRisk(weightedScore);

  const summary =
    findings.length === 0
      ? "No obvious biased wording was detected. Keep using consistent, skills-based language and structured interview rubrics."
      : `Detected ${findings.length} potentially biased phrase${
          findings.length === 1 ? "" : "s"
        } that may weaken inclusiveness and increase compliance risk.`;

  return {
    summary,
    riskScore,
    legalNote:
      "Use this report as a drafting aid, then validate final wording against your company policy and local employment law.",
    normalizedText: buildNormalizedText(text, findings),
    findings
  };
}

function sanitizeOpenAiJson(raw: string): string {
  return raw
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "");
}

function normalizeFromModel(baseText: string, result: BiasAnalysisResult): BiasAnalysisResult {
  return {
    summary: result.summary,
    legalNote: result.legalNote,
    riskScore: clampRisk(result.riskScore),
    normalizedText: result.normalizedText || buildNormalizedText(baseText, result.findings ?? []),
    findings: (result.findings ?? []).map((finding, index) => ({
      id: finding.id || `finding-${index + 1}`,
      category: finding.category || "Potential bias",
      severity:
        finding.severity === "high" || finding.severity === "low" ? finding.severity : "medium",
      snippet: finding.snippet,
      reason: finding.reason,
      suggestion: finding.suggestion,
      startIndex: typeof finding.startIndex === "number" ? finding.startIndex : -1,
      endIndex: typeof finding.endIndex === "number" ? finding.endIndex : -1
    }))
  };
}

export async function analyzeBias(text: string): Promise<BiasAnalysisResult> {
  const trimmed = text.trim();

  if (!trimmed) {
    throw new Error("No text provided for analysis.");
  }

  if (!client) {
    return heuristicAnalysis(trimmed);
  }

  try {
    const completion = await client.chat.completions.create({
      model: MODEL,
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            "You are an expert HR compliance reviewer. Return strict JSON only with keys: summary, riskScore (0-100 number), legalNote, normalizedText, findings. findings is an array of objects with id, category, severity (low|medium|high), snippet, reason, suggestion, startIndex, endIndex. Keep advice practical and non-legal in tone."
        },
        {
          role: "user",
          content: `Analyze this hiring content for biased language and propose neutral alternatives:\n\n${trimmed}`
        }
      ]
    });

    const raw = completion.choices[0]?.message?.content;

    if (!raw) {
      return heuristicAnalysis(trimmed);
    }

    const parsed = JSON.parse(sanitizeOpenAiJson(raw)) as BiasAnalysisResult;
    return normalizeFromModel(trimmed, parsed);
  } catch {
    return heuristicAnalysis(trimmed);
  }
}
