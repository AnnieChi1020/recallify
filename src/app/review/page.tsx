import { auth } from "@clerk/nextjs/server";
import { and, eq, lte } from "drizzle-orm";

import { db } from "@/db";
import { cards, cardStates, decks } from "@/db/schema";

import { ReviewSession, type Card } from "./review-session";

export default async function ReviewPage() {
  const { userId } = await auth.protect();

  const dueCards = await db
    .select({
      id: cards.id,
      type: cards.type,
      question: cards.question,
      answer: cards.answer,
      options: cards.options,
    })
    .from(cardStates)
    .innerJoin(cards, eq(cardStates.cardId, cards.id))
    .innerJoin(decks, eq(cards.deckId, decks.id))
    .where(and(eq(decks.userId, userId), lte(cardStates.dueAt, new Date())))
    .orderBy(cardStates.dueAt)
    .limit(20);

  return (
    <main className="mx-auto max-w-xl px-4 py-16">
      <ReviewSession initialCards={dueCards as Card[]} />
    </main>
  );
}
