import { auth } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";

import { db } from "@/db";
import { decks, cards } from "@/db/schema";

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
    <main className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-2xl font-semibold">{deck.title}</h1>
      <p className="text-sm text-zinc-500 mb-8">{deckCards.length} cards</p>
      <ul className="flex flex-col gap-3">
        {deckCards.map((card) => (
          <li key={card.id} className="border rounded-lg p-4">
            <p className="font-medium">{card.question}</p>
            <p className="text-sm text-zinc-500 mt-1">{card.answer}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
