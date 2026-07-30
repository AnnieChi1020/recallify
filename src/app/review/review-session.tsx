"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

export type Card = {
  id: string;
  type: "qa" | "mcq";
  question: string;
  answer: string;
  options: string[] | null;
};

const RATINGS = [
  { label: "Again", value: 1 },
  { label: "Hard", value: 3 },
  { label: "Good", value: 4 },
  { label: "Easy", value: 5 },
];

export function ReviewSession({ initialCards }: { initialCards: Card[] }) {
  const [queue, setQueue] = useState(initialCards);
  const [revealed, setRevealed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const current = queue[0];

  async function handleRate(rating: number) {
    if (!current || submitting) return;
    setSubmitting(true);

    const res = await fetch(`/api/review/${current.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating }),
    });

    setSubmitting(false);
    if (!res.ok) return; // 失敗就留在原地,不推進佇列

    setQueue((q) => q.slice(1));
    setRevealed(false);
  }

  if (!current) {
    return (
      <div className="text-center py-16">
        <p className="text-lg font-medium">{`Today's review is complete`}</p>
        <p className="text-sm text-zinc-500 mt-1">
          Come back tomorrow for more.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-xs text-zinc-400">{queue.length} cards left</p>
      <div className="border rounded-lg p-6 min-h-40">
        <p className="text-lg font-medium">{current.question}</p>
        {revealed && (
          <p className="text-zinc-600 mt-4 pt-4 border-t">{current.answer}</p>
        )}
      </div>

      {!revealed ? (
        <Button onClick={() => setRevealed(true)} size="lg">
          Show answer
        </Button>
      ) : (
        <div className="grid grid-cols-4 gap-2">
          {RATINGS.map((r) => (
            <Button
              key={r.value}
              variant="outline"
              disabled={submitting}
              onClick={() => handleRate(r.value)}
            >
              {r.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
