import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { decks } from "@/db/schema";

export default async function DashboardPage() {
  const { userId } = await auth.protect();

  const userDecks = await db
    .select()
    .from(decks)
    .where(eq(decks.userId, userId));

  return (
    <main className="flex flex-1 flex-col items-center justify-center">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="mt-2 text-zinc-500">You have {userDecks.length} decks.</p>
    </main>
  );
}
