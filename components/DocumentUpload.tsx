"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { FileText, UploadCloud, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type DocumentUploadProps = {
  selectedFile: File | null;
  disabled?: boolean;
  onFileSelected: (file: File | null) => void;
};

function formatBytes(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentUpload({
  selectedFile,
  disabled,
  onFileSelected
}: DocumentUploadProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileSelected(acceptedFiles[0]);
      }
    },
    [onFileSelected]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled,
    maxFiles: 1,
    accept: {
      "text/plain": [".txt"],
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"]
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base text-slate-100">Upload Document</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div
          {...getRootProps()}
          className={`cursor-pointer rounded-lg border border-dashed p-5 transition-colors ${
            isDragActive
              ? "border-cyan-400 bg-cyan-500/10"
              : "border-slate-700 bg-slate-950/60 hover:border-slate-500"
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center gap-2 text-center">
            <UploadCloud className="h-6 w-6 text-cyan-300" />
            <p className="text-sm text-slate-200">
              Drag and drop a job description or interview notes file
            </p>
            <p className="text-xs text-slate-400">Accepts TXT, PDF, DOC, DOCX</p>
          </div>
        </div>

        {selectedFile ? (
          <div className="rounded-lg border border-slate-700 bg-slate-950/70 p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-cyan-300" />
                <div>
                  <p className="text-sm font-medium text-slate-100">{selectedFile.name}</p>
                  <p className="text-xs text-slate-400">{formatBytes(selectedFile.size)}</p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onFileSelected(null)}
                className="h-8 px-2 text-slate-300"
                disabled={disabled}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
