"use client";

import { Pencil, Trash2, Check, X } from "lucide-react";
import { useState } from "react";

import {
  AlertDialogRoot,
  AlertDialogTrigger,
  AlertDialogPortal,
  AlertDialogBackdrop,
  AlertDialogPopup,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogClose,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export type CardItem = {
  id: string;
  question: string;
  answer: string;
  options: unknown;
};

type EditDraft = {
  question: string;
  answer: string;
};

export function CardList({ initialCards }: { initialCards: CardItem[] }) {
  const [cards, setCards] = useState(initialCards);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<EditDraft>({ question: "", answer: "" });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function startEdit(card: CardItem) {
    setEditing(card.id);
    setDraft({ question: card.question, answer: card.answer });
  }

  function cancelEdit() {
    setEditing(null);
  }

  async function handleSave(id: string) {
    if (saving) return;
    setSaving(true);

    const res = await fetch(`/api/cards/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });

    setSaving(false);
    if (!res.ok) return;

    const updated = await res.json();
    setCards((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, question: updated.question, answer: updated.answer }
          : c,
      ),
    );
    setEditing(null);
  }

  async function handleDelete(id: string) {
    if (deleting) return;
    setDeleting(true);

    const res = await fetch(`/api/cards/${id}`, { method: "DELETE" });

    setDeleting(false);
    if (!res.ok) return;

    setCards((prev) => prev.filter((c) => c.id !== id));
  }

  if (cards.length === 0) {
    return <p className="text-sm text-zinc-400">No cards in this deck yet.</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {cards.map((card) => {
        const isEditing = editing === card.id;

        return (
          <li key={card.id} className="border rounded-lg p-4">
            {isEditing ? (
              <div className="flex flex-col gap-2">
                <Textarea
                  value={draft.question}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, question: e.target.value }))
                  }
                  placeholder="Question"
                />
                <Textarea
                  value={draft.answer}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, answer: e.target.value }))
                  }
                  placeholder="Answer"
                />
                <div className="flex gap-2 mt-1">
                  <Button
                    size="sm"
                    onClick={() => handleSave(card.id)}
                    disabled={
                      saving || !draft.question.trim() || !draft.answer.trim()
                    }
                  >
                    <Check className="size-3.5" />
                    Save
                  </Button>
                  <Button size="sm" variant="ghost" onClick={cancelEdit}>
                    <X className="size-3.5" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium">{card.question}</p>
                  <p className="text-sm text-zinc-500 mt-1">{card.answer}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => startEdit(card)}
                    aria-label="Edit card"
                  >
                    <Pencil />
                  </Button>
                  <AlertDialogRoot>
                    <AlertDialogTrigger
                      render={
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          aria-label="Delete card"
                        >
                          <Trash2 />
                        </Button>
                      }
                    />
                    <AlertDialogPortal>
                      <AlertDialogBackdrop />
                      <AlertDialogPopup>
                        <AlertDialogTitle>Delete this card?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete the card and its review
                          history. This action cannot be undone.
                        </AlertDialogDescription>
                        <div className="flex justify-end gap-2 mt-6">
                          <AlertDialogClose variant="outline" size="sm">
                            Cancel
                          </AlertDialogClose>
                          <AlertDialogClose
                            variant="destructive"
                            size="sm"
                            disabled={deleting}
                            onClick={() => handleDelete(card.id)}
                          >
                            Delete
                          </AlertDialogClose>
                        </div>
                      </AlertDialogPopup>
                    </AlertDialogPortal>
                  </AlertDialogRoot>
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
