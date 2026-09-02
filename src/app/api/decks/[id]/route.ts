import { auth } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";

import { db } from "@/db";
import { decks } from "@/db/schema";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { userId } = await auth();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [existing] = await db
    .select({ id: decks.id })
    .from(decks)
    .where(and(eq(decks.id, id), eq(decks.userId, userId)));

  if (!existing) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  await db.delete(decks).where(eq(decks.id, id));

  return new Response(null, { status: 204 });
}
