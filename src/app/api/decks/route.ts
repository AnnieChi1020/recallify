import { auth } from "@clerk/nextjs/server";
import { eq, desc } from "drizzle-orm";
import { flattenError } from "zod";

import { db } from "@/db";
import {
  decks as decksTable,
  cards as cardsTable,
  cardStates as cardStatesTable,
} from "@/db/schema";
import { generateCardsFromText } from "@/lib/generate-cards";
import { createDeckSchema } from "@/lib/validations";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userDecks = await db
    .select()
    .from(decksTable)
    .where(eq(decksTable.userId, userId))
    .orderBy(desc(decksTable.createdAt));

  return Response.json(userDecks);
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createDeckSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid request body", details: flattenError(parsed.error) },
      { status: 400 },
    );
  }

  let cards: Awaited<ReturnType<typeof generateCardsFromText>>;
  try {
    cards = await generateCardsFromText(parsed.data.sourceText);
  } catch {
    return Response.json(
      { error: "Card generation failed. Please try again." },
      { status: 502 },
    );
  }

  const deck = await db.transaction(async (tx) => {
    const [newDeck] = await tx
      .insert(decksTable)
      .values({
        userId,
        title: parsed.data.title,
        sourceText: parsed.data.sourceText,
      })
      .returning();

    const newCards = await tx
      .insert(cardsTable)
      .values(cards.map((card) => ({ ...card, deckId: newDeck.id })))
      .returning();

    await tx
      .insert(cardStatesTable)
      .values(newCards.map((card) => ({ cardId: card.id, dueAt: new Date() })));

    return newDeck;
  });

  return Response.json(deck, { status: 201 });
}
