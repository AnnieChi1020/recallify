import { auth } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";

import { db } from "@/db";
import { decks, cards } from "@/db/schema";

import { CardList } from "./card-list";

export default async function DeckPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { userId } = await auth.protect();

  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) notFound();

  const [deck] = await db
    .select()
    .from(decks)
    .where(and(eq(decks.id, id), eq(decks.userId, userId)));

  if (!deck) notFound();

  const deckCards = await db.select().from(cards).where(eq(cards.deckId, id));

  return (
    <main className="w-full max-w-2xl mx-auto px-4 py-16">
      <h1 className="text-2xl font-semibold">{deck.title}</h1>
      <p className="text-sm text-zinc-500 mb-8">{deckCards.length} cards</p>
      <CardList initialCards={deckCards} />
    </main>
  );
}
