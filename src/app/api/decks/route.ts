import { auth } from "@clerk/nextjs/server";
import { eq, desc } from "drizzle-orm";
import { flattenError } from "zod";

import { db } from "@/db";
import { decks } from "@/db/schema";
import { createDeckSchema } from "@/lib/validations";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userDecks = await db
    .select()
    .from(decks)
    .where(eq(decks.userId, userId))
    .orderBy(desc(decks.createdAt));

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

  const [deck] = await db
    .insert(decks)
    .values({
      userId,
      title: parsed.data.title,
      sourceText: parsed.data.sourceText,
    })
    .returning();

  return Response.json(deck, { status: 201 });
}
