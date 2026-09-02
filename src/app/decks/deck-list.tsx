"use client";

import { Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
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

export type DeckItem = {
  id: string;
  title: string;
};

export function DeckList({ initialDecks }: { initialDecks: DeckItem[] }) {
  const [decks, setDecks] = useState(initialDecks);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete(id: string) {
    if (deleting) return;
    setDeleting(true);

    const res = await fetch(`/api/decks/${id}`, { method: "DELETE" });

    setDeleting(false);
    if (!res.ok) return;

    setDecks((prev) => prev.filter((d) => d.id !== id));
  }

  if (decks.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No decks yet.{" "}
        <Link href="/decks/new" className="underline underline-offset-4">
          Create your first deck.
        </Link>
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {decks.map((deck) => (
        <li
          key={deck.id}
          className="flex items-center justify-between rounded-2xl border pr-3 transition-colors hover:border-foreground/40"
        >
          <Link href={`/decks/${deck.id}`} className="flex-1 font-medium px-5 py-4">
            {deck.title}
          </Link>
          <AlertDialogRoot>
            <AlertDialogTrigger
              render={
                <Button size="icon-sm" variant="ghost" aria-label="Delete deck">
                  <Trash2 />
                </Button>
              }
            />
            <AlertDialogPortal>
              <AlertDialogBackdrop />
              <AlertDialogPopup>
                <AlertDialogTitle>Delete &ldquo;{deck.title}&rdquo;?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the deck and all its cards. This action cannot be undone.
                </AlertDialogDescription>
                <div className="flex justify-end gap-2 mt-6">
                  <AlertDialogClose variant="outline" size="sm">
                    Cancel
                  </AlertDialogClose>
                  <AlertDialogClose
                    variant="destructive"
                    size="sm"
                    disabled={deleting}
                    onClick={() => handleDelete(deck.id)}
                  >
                    Delete
                  </AlertDialogClose>
                </div>
              </AlertDialogPopup>
            </AlertDialogPortal>
          </AlertDialogRoot>
        </li>
      ))}
    </ul>
  );
}
