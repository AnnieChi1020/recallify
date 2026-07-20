"use client";

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

    router.push("/dashboard");
  }

  return (
    <main className="flex flex-1 flex-col items-center px-4 py-16">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight mb-1">New Deck</h1>
        <p className="text-sm text-zinc-500 mb-10">
          Paste your text and we&apos;ll generate flashcards using AI.
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
            <Label htmlFor="sourceText">Source Text</Label>
            <Textarea
              id="sourceText"
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              disabled={isLoading}
              placeholder="Paste the text you want to turn into flashcards…"
              rows={12}
              className="resize-none text-base h-60 overflow-y-auto"
            />
            <p
              className={`text-xs text-right tabular-nums ${isOverLimit ? "text-red-500 font-medium" : "text-zinc-400"}`}
            >
              {charCount.toLocaleString()} / {MAX_SOURCE_TEXT.toLocaleString()}
            </p>
          </div>

          {status === "error" && (
            <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3">
              Card generation failed. Your text is still here — please try
              again.
            </p>
          )}

          {isLoading && (
            <p className="text-sm text-zinc-500">
              Generating cards… this usually takes 5–10 seconds.
            </p>
          )}

          <Button
            type="submit"
            disabled={isDisabled}
            size="lg"
            className="w-full"
          >
            {isLoading
              ? "Generating cards…"
              : status === "error"
                ? "Try Again"
                : "Generate Flashcards"}
          </Button>
        </form>
      </div>
    </main>
  );
}
