import { auth } from "@clerk/nextjs/server";
import { eq, and, lte } from "drizzle-orm";

import { db } from "@/db";
import { decks, cardStates, cards } from "@/db/schema";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dueCards = await db
    .select({
      id: cards.id,
      deckId: cards.deckId,
      type: cards.type,
      question: cards.question,
      answer: cards.answer,
      options: cards.options,
      dueAt: cardStates.dueAt,
    })
    .from(cardStates)
    .innerJoin(cards, eq(cardStates.cardId, cards.id))
    .innerJoin(decks, eq(cards.deckId, decks.id))
    .where(and(eq(decks.userId, userId), lte(cardStates.dueAt, new Date())))
    .orderBy(cardStates.dueAt)
    .limit(20);

  return Response.json(dueCards);
}
