import { NextResponse } from "next/server";
import mammoth from "mammoth";
import { analyzeBias } from "@/lib/openai";

export const runtime = "nodejs";

const MAX_TEXT_LENGTH = 30000;

function truncateText(text: string): string {
  if (text.length <= MAX_TEXT_LENGTH) {
    return text;
  }

  return text.slice(0, MAX_TEXT_LENGTH);
}

async function extractTextFromFile(file: File): Promise<string> {
  const fileName = file.name.toLowerCase();
  const mimeType = file.type.toLowerCase();
  const buffer = Buffer.from(await file.arrayBuffer());

  if (mimeType === "application/pdf" || fileName.endsWith(".pdf")) {
    const module = await import("pdf-parse");
    const parsePdf = (module.default ?? module) as (payload: Buffer) => Promise<{ text: string }>;
    const parsed = await parsePdf(buffer);
    return parsed.text ?? "";
  }

  if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    fileName.endsWith(".docx")
  ) {
    const parsed = await mammoth.extractRawText({ buffer });
    return parsed.value ?? "";
  }

  if (mimeType === "application/msword" || fileName.endsWith(".doc")) {
    const parsed = await mammoth.extractRawText({ buffer });
    return parsed.value ?? "";
  }

  return new TextDecoder("utf-8").decode(buffer);
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    let combinedText = "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const textPart = String(formData.get("text") ?? "").trim();
      const file = formData.get("file");

      let fileText = "";
      if (file instanceof File) {
        fileText = (await extractTextFromFile(file)).trim();
      }

      combinedText = [fileText, textPart].filter(Boolean).join("\n\n");
    } else {
      const body = (await request.json()) as { text?: string };
      combinedText = String(body.text ?? "").trim();
    }

    if (!combinedText) {
      return NextResponse.json(
        { error: "No text or supported document content was provided." },
        { status: 400 }
      );
    }

    const sourceText = truncateText(combinedText);
    const analysis = await analyzeBias(sourceText);

    return NextResponse.json({ sourceText, analysis });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to process content for bias analysis.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
