"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Sparkles, ShieldAlert } from "lucide-react";
import { BiasReport } from "@/components/BiasReport";
import { DocumentUpload } from "@/components/DocumentUpload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { BiasAnalysisResult } from "@/lib/types";

type AnalyzeResponse = {
  sourceText: string;
  analysis: BiasAnalysisResult;
};

export function BiasAnalyzer() {
  const [text, setText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<BiasAnalysisResult | null>(null);
  const [analyzedText, setAnalyzedText] = useState("");
  const lastAutoScanText = useRef("");

  const wordCount = useMemo(() => {
    const words = text.trim().split(/\s+/).filter(Boolean);
    return words.length;
  }, [text]);

  async function runAnalyze(options?: { silent?: boolean; source?: "manual" | "auto" }) {
    const silent = options?.silent ?? false;
    const source = options?.source ?? "manual";

    setError(null);
    if (!silent) {
      setReport(null);
    }

    if (!text.trim() && !selectedFile) {
      setError("Add text or upload a document before running analysis.");
      return;
    }

    if (isLoading) {
      return;
    }

    setIsLoading(true);

    try {
      const init: RequestInit = { method: "POST" };

      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        if (text.trim()) {
          formData.append("text", text.trim());
        }
        init.body = formData;
      } else {
        init.headers = { "Content-Type": "application/json" };
        init.body = JSON.stringify({ text });
      }

      const response = await fetch("/api/analyze", init);
      const data = (await response.json()) as AnalyzeResponse | { error: string };

      if (!response.ok) {
        throw new Error("error" in data ? data.error : "Failed to analyze text.");
      }

      const parsed = data as AnalyzeResponse;
      setAnalyzedText(parsed.sourceText);
      setReport(parsed.analysis);

      if (source === "auto") {
        lastAutoScanText.current = text.trim();
      }

      if (!text.trim()) {
        setText(parsed.sourceText);
      }
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Unexpected error while analyzing text.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (selectedFile) {
      return;
    }

    const trimmed = text.trim();

    if (trimmed.length < 120) {
      return;
    }

    if (trimmed === lastAutoScanText.current) {
      return;
    }

    const timeout = setTimeout(() => {
      void runAnalyze({ silent: true, source: "auto" });
    }, 900);

    return () => clearTimeout(timeout);
  }, [text, selectedFile]);

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle className="text-slate-100">Analyze Hiring Content</CardTitle>
          <CardDescription>
            Paste a job description or interview feedback notes, or upload a source document.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <DocumentUpload
            selectedFile={selectedFile}
            onFileSelected={setSelectedFile}
            disabled={isLoading}
          />

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Manual text input</span>
              <span>{wordCount} words</span>
            </div>
            <Textarea
              placeholder="Example: We need a rockstar salesperson who can dominate a young market and thrive under pressure..."
              value={text}
              onChange={(event) => setText(event.target.value)}
              className="min-h-56"
              disabled={isLoading}
            />
            <p className="text-xs text-slate-500">
              Auto-scan runs after you pause typing. Use the button for immediate re-checks.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={() => void runAnalyze({ source: "manual" })} disabled={isLoading} size="lg">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Scanning for bias
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Analyze Content
                </>
              )}
            </Button>
            <p className="text-xs text-slate-400">
              AI results are guidance. Always use your structured interview rubric and policy review.
            </p>
          </div>

          {error ? (
            <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-200">
              <p className="mb-1 flex items-center gap-2 font-medium">
                <ShieldAlert className="h-4 w-4" />
                Analysis failed
              </p>
              {error}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {report ? <BiasReport report={report} sourceText={analyzedText || text} /> : null}
    </div>
  );
}
