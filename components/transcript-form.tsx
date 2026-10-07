"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { FileText, Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AiProgress, type ProgressState } from "@/components/ai-progress";
import { ResultPanel, type TranscriptResult } from "@/components/result-panel";
import { MEETING_TRANSCRIPT } from "@/lib/seed-data";
import { cn } from "@/lib/utils";

type ApiBody =
  | TranscriptResult
  | { error: string }
  | { status?: undefined; error?: string };

function asTranscriptResult(body: ApiBody): TranscriptResult {
  if ("status" in body && body.status === "ok") return body;
  if ("status" in body && body.status === "invalid") return body;
  if ("status" in body && body.status === "error") return body;
  return {
    status: "error",
    error:
      ("error" in body && typeof body.error === "string" && body.error) ||
      "The import failed and nothing was saved.",
  };
}

export function TranscriptForm({ className }: { className?: string }) {
  const [transcript, setTranscript] = useState("");
  const [pending, setPending] = useState(false);
  const [state, setState] = useState<ProgressState>("idle");
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<TranscriptResult | null>(null);
  const submittingRef = useRef(false);

  // Visual stepper progression while the request is in flight.
  useEffect(() => {
    if (!pending) return;
    const first = setTimeout(() => setStep(1), 450);
    const second = setTimeout(() => setStep(2), 1700);
    return () => {
      clearTimeout(first);
      clearTimeout(second);
    };
  }, [pending]);

  const reset = useCallback(() => {
    setResult(null);
    setState("idle");
    setStep(0);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (submittingRef.current || pending) return;

    const value = transcript.trim();
    if (value.length === 0) {
      toast.error("Paste a meeting transcript first.");
      return;
    }

    submittingRef.current = true;
    setPending(true);
    setResult(null);
    setState("running");
    setStep(0);

    try {
      const response = await fetch("/api/transcript", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: value }),
      });

      const body = (await response.json()) as ApiBody;
      const parsed = asTranscriptResult(body);

      if (parsed.status === "ok") {
        setStep(3);
        setState("success");
        setResult(parsed);
        toast.success(
          `${parsed.created.projects} projects · ${parsed.created.tasks} tasks · ${parsed.created.hours} h created`,
        );
      } else if (parsed.status === "invalid") {
        setStep(2);
        setState("invalid");
        setResult(parsed);
        toast.error("The AI output needs correction. Nothing was saved.");
      } else {
        setStep(2);
        setState("error");
        setResult(parsed);
        toast.error(parsed.error);
      }
    } catch {
      setStep(2);
      setState("error");
      setResult({
        status: "error",
        error: "Network error — the server could not be reached. Please retry.",
      });
      toast.error("Network error. Please retry.");
    } finally {
      submittingRef.current = false;
      setPending(false);
    }
  }, [pending, transcript]);

  const characters = transcript.length;

  return (
    <div className={cn("grid gap-6 lg:grid-cols-2", className)}>
      {/* Left — input */}
      <section className="glass space-y-4 rounded-[var(--radius)] p-6 shadow-glass">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-accent" />
            <h2 className="font-medium">Meeting transcript</h2>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={pending}
            onClick={() => {
              setTranscript(MEETING_TRANSCRIPT);
              reset();
              toast.success("Sample transcript loaded.");
            }}
          >
            Load sample transcript
          </Button>
        </div>

        <textarea
          value={transcript}
          onChange={(event) => setTranscript(event.target.value)}
          readOnly={pending}
          spellCheck={false}
          minLength={50}
          aria-label="Meeting transcript"
          placeholder="09:00 | Ayesha: Let's lock the UrbanCart scope…"
          className="min-h-[380px] w-full resize-y rounded-[var(--radius)] border border-border bg-muted p-4 font-mono text-[13px] leading-relaxed text-foreground shadow-inner outline-none transition-shadow placeholder:text-muted-foreground/60 focus-visible:border-accent/50 focus-visible:ring-2 focus-visible:ring-accent/40 disabled:opacity-60"
        />

        <div className="flex items-center justify-between gap-3">
          <span className="font-mono text-xs text-muted-foreground">
            {characters} characters
          </span>
          <Button
            onClick={handleSubmit}
            disabled={pending || transcript.trim().length === 0}
          >
            {pending ? (
              <>
                <Sparkles className="size-4 animate-pulse" /> Processing…
              </>
            ) : (
              <>
                <Wand2 className="size-4" /> Create from Transcript
              </>
            )}
          </Button>
        </div>
      </section>

      {/* Right — AI progress / result */}
      <section className="space-y-4">
        <div className="glass space-y-4 rounded-[var(--radius)] p-6 shadow-glass">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-accent" />
            <h2 className="font-medium">AI pipeline</h2>
          </div>
          <AiProgress state={state} step={step} />
          {state === "idle" ? (
            <p className="text-sm text-muted-foreground">
              Paste a transcript (or load the sample) and the pipeline will extract,
              validate and save the agreed projects in one transaction.
            </p>
          ) : null}
        </div>

        {result ? <ResultPanel result={result} onRetry={reset} /> : null}
      </section>
    </div>
  );
}
