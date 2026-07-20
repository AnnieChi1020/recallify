"use client";

import { AlertCircle, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const MAX_SOURCE_TEXT = 8000;

type Status = "idle" | "loading" | "error";

export default function NewDeckPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [sourceText, setSourceText] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const charCount = sourceText.length;
  const isOverLimit = charCount > MAX_SOURCE_TEXT;
  const isLoading = status === "loading";
  const isDisabled =
    isLoading || isOverLimit || !title.trim() || !sourceText.trim();

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    if (isDisabled) return;

    setStatus("loading");

    const res = await fetch("/api/decks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, sourceText }),
    });

    if (!res.ok) {
      setStatus("error");
      return;
    }

    const deck = await res.json();
    router.push(`/decks/${deck.id}`);
  }

  return (
    <main className="flex flex-1 flex-col items-center px-4 py-16">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight mb-1">
          Create a new deck
        </h1>
        <p className="text-sm text-zinc-500 mb-10">
          Paste any text and AI will turn it into flashcards.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
              placeholder="e.g. The Water Cycle"
              className="h-11 text-base"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="sourceText">Source text</Label>
            <Textarea
              id="sourceText"
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              disabled={isLoading}
              placeholder="Paste your notes, an article, or a transcript…"
              rows={12}
              className="text-base h-60 overflow-y-auto"
            />
            <p
              className={`text-xs tabular-nums ${isOverLimit ? "text-red-500 font-medium" : "text-zinc-400"}`}
            >
              {charCount.toLocaleString()} / {MAX_SOURCE_TEXT.toLocaleString()}{" "}
              characters
            </p>
          </div>

          {status === "error" && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3">
              <AlertCircle className="size-4 shrink-0" />
              <span>
                Card generation failed. Your text is safe below — try again.
              </span>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Button
              type="submit"
              disabled={isDisabled}
              size="lg"
              className="w-full"
            >
              {isLoading && <LoaderCircle className="animate-spin" />}
              {isLoading
                ? "Generating cards…"
                : status === "error"
                  ? "Try again"
                  : "Generate flashcards"}
            </Button>
            {isLoading && (
              <p className="text-xs text-center text-zinc-500">
                This usually takes 5–10 seconds. Don&apos;t close the page.
              </p>
            )}
          </div>
        </form>
      </div>
    </main>
  );
}
