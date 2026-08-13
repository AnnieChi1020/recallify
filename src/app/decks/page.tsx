import { auth } from "@clerk/nextjs/server";
import { desc, eq } from "drizzle-orm";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { db } from "@/db";
import { decks } from "@/db/schema";
import { getStatsForUser } from "@/lib/stats";

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

      {userDecks.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No decks yet.{" "}
          <Link href="/decks/new" className="underline underline-offset-4">
            Create your first deck.
          </Link>
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {userDecks.map((deck) => (
            <li key={deck.id}>
              <Link
                href={`/decks/${deck.id}`}
                className="flex items-center justify-between rounded-2xl border px-5 py-4 hover:bg-muted transition-colors group"
              >
                <span className="font-medium group-hover:text-foreground transition-colors">
                  {deck.title}
                </span>
                <span className="text-muted-foreground text-sm">→</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
