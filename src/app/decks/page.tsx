import { auth } from "@clerk/nextjs/server";
import { desc, eq } from "drizzle-orm";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { db } from "@/db";
import { decks } from "@/db/schema";
import { getStatsForUser } from "@/lib/stats";

import { DeckList } from "./deck-list";

export default async function DecksPage() {
  const { userId } = await auth.protect();

  const [userDecks, stats] = await Promise.all([
    db
      .select()
      .from(decks)
      .where(eq(decks.userId, userId))
      .orderBy(desc(decks.createdAt)),
    getStatsForUser(userId),
  ]);

  const summaryCards = [
    { label: "Decks", value: stats.totalDecks },
    { label: "Cards", value: stats.totalCards },
    { label: "Due Today", value: stats.dueToday },
    {
      label: "Accuracy",
      value: stats.accuracy === null ? "—" : `${stats.accuracy}%`,
    },
  ];

  return (
    <main className="w-full max-w-2xl mx-auto px-4 py-16">
      <div className="grid grid-cols-4 gap-3 mb-10">
        {summaryCards.map(({ label, value }) => (
          <div
            key={label}
            className="rounded-2xl bg-muted px-4 py-4 flex flex-col gap-1.5"
          >
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {label}
            </span>
            <span className="text-3xl font-bold tabular-nums">{value}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-semibold">My Decks</h1>
        <Link href="/decks/new" className={buttonVariants()}>
          New deck
        </Link>
      </div>

      <DeckList initialDecks={userDecks} />
    </main>
  );
}
