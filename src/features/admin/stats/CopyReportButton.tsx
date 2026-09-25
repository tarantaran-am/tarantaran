"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

type Status = "idle" | "copied" | "failed";

const LABELS: Record<Status, string> = { idle: "Отчёт", copied: "Скопировано", failed: "Не скопировалось" };

export function CopyReportButton({ report }: { report: string }) {
  const [status, setStatus] = useState<Status>("idle");

  async function copy() {
    const copied = await copyText(report);
    setStatus(copied ? "copied" : "failed");
    setTimeout(() => setStatus("idle"), 2000);
  }

  return (
    <button
      type="button"
      onClick={copy}
      title={report}
      className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs whitespace-nowrap text-foreground hover:bg-muted"
    >
      {status === "copied" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {LABELS[status]}
    </button>
  );
}

// The Clipboard API can be refused (permissions, embedded browsers); the old select-and-copy still works there.
async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.append(textarea);
    textarea.select();
    const copied = document.execCommand("copy");
    textarea.remove();
    return copied;
  }
}
