export type BiasSeverity = "low" | "medium" | "high";

export type BiasFinding = {
  id: string;
  category: string;
  severity: BiasSeverity;
  snippet: string;
  reason: string;
  suggestion: string;
  startIndex: number;
  endIndex: number;
};

export type BiasAnalysisResult = {
  summary: string;
  riskScore: number;
  legalNote: string;
  normalizedText: string;
  findings: BiasFinding[];
};

export type StoredPaidSession = {
  email: string | null;
  paidAt: string;
  amountTotal: number | null;
  currency: string | null;
  paymentLinkId: string | null;
};

export type StoredAccessToken = {
  sessionId: string;
  issuedAt: string;
  expiresAt: string;
};
