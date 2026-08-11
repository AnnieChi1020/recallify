import { auth } from "@clerk/nextjs/server";
import { eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { cards, cardStates, decks, reviews } from "@/db/schema";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [deckStats] = await db
    .select({
      totalDecks: sql<number>`count(distinct ${decks.id})`,
      totalCards: sql<number>`count(distinct ${cards.id})`,
      dueToday: sql<number>`count(distinct ${cardStates.cardId}) filter (where ${cardStates.dueAt} <= now())`,
    })
    .from(decks)
    .leftJoin(cards, eq(cards.deckId, decks.id))
    .leftJoin(cardStates, eq(cardStates.cardId, cards.id))
    .where(eq(decks.userId, userId));

  const [reviewStats] = await db
    .select({
      totalReviews: sql<number>`count(distinct ${reviews.id})`,
      accuracy: sql<number>`round(avg(case when ${reviews.rating} >= 3 then 1 else 0 end) * 100)`,
    })
    .from(reviews)
    .innerJoin(cards, eq(cards.id, reviews.cardId))
    .innerJoin(decks, eq(decks.id, cards.deckId))
    .where(eq(decks.userId, userId));

  return Response.json({
    totalDecks: Number(deckStats.totalDecks),
    totalCards: Number(deckStats.totalCards),
    dueToday: Number(deckStats.dueToday),
    totalReviews: Number(reviewStats.totalReviews),
    accuracy: Number(reviewStats.accuracy),
  });
}
