import { auth } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";
import { flattenError } from "zod";

import { db } from "@/db";
import { cards, decks } from "@/db/schema";
import { updateCardSchema } from "@/lib/validations";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { userId } = await auth();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = updateCardSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid request body", details: flattenError(parsed.error) },
      { status: 400 },
    );
  }

  const [existing] = await db
    .select({ id: cards.id })
    .from(cards)
    .innerJoin(decks, eq(cards.deckId, decks.id))
    .where(and(eq(cards.id, id), eq(decks.userId, userId)));

  if (!existing) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const [updated] = await db
    .update(cards)
    .set(parsed.data)
    .where(eq(cards.id, id))
    .returning();

  return Response.json(updated);
}
