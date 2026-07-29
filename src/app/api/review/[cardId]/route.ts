import { auth } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";
import { flattenError } from "zod";

import { db } from "@/db";
import { cards, cardStates, decks, reviews } from "@/db/schema";
import { calculateNextReview } from "@/lib/sm2";
import { submitReviewSchema } from "@/lib/validations";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ cardId: string }> },
) {
  const { cardId } = await params;
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = submitReviewSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      {
        error: "Invalid request body",
        details: flattenError(parsed.error),
      },
      { status: 400 },
    );
  }

  const [current] = await db
    .select({
      easeFactor: cardStates.easeFactor,
      intervalDays: cardStates.intervalDays,
      repetitions: cardStates.repetitions,
    })
    .from(cardStates)
    .innerJoin(cards, eq(cards.id, cardStates.cardId))
    .innerJoin(decks, eq(cards.deckId, decks.id))
    .where(and(eq(cardStates.cardId, cardId), eq(decks.userId, userId)));

  if (!current) {
    return Response.json(
      {
        error: "Not found",
      },
      { status: 404 },
    );
  }

  const next = calculateNextReview(current, parsed.data.rating);

  await db.transaction(async (tx) => {
    await tx
      .update(cardStates)
      .set({
        easeFactor: next.easeFactor,
        intervalDays: next.intervalDays,
        repetitions: next.repetitions,
        dueAt: next.dueAt,
      })
      .where(eq(cardStates.cardId, cardId));

    await tx.insert(reviews).values({ cardId, rating: parsed.data.rating });
  });

  return Response.json(next);
}
