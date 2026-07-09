import { auth } from "@clerk/nextjs/server";
import { eq, desc } from "drizzle-orm";

import { db } from "@/db";
import { decks } from "@/db/schema";

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
