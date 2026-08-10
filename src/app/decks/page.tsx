import { auth } from "@clerk/nextjs/server";
import { desc, eq } from "drizzle-orm";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { db } from "@/db";
import { decks } from "@/db/schema";

export default async function DecksPage() {
  const { userId } = await auth.protect();

  const userDecks = await db
    .select()
    .from(decks)
    .where(eq(decks.userId, userId))
    .orderBy(desc(decks.createdAt));

  return (
    <main className="w-full max-w-2xl mx-auto px-4 py-16">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold">My Decks</h1>
        <Link href="/decks/new" className={buttonVariants()}>
          New deck
        </Link>
      </div>

      {userDecks.length === 0 ? (
        <p className="text-sm text-zinc-400">
          No decks yet.{" "}
          <Link href="/decks/new" className="underline underline-offset-4">
            Create your first deck.
          </Link>
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {userDecks.map((deck) => (
            <li key={deck.id}>
              <Link
                href={`/decks/${deck.id}`}
                className="flex items-center justify-between rounded-xl border px-5 py-4 hover:bg-zinc-50 transition-colors"
              >
                <span className="font-medium">{deck.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
