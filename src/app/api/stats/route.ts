import { auth } from "@clerk/nextjs/server";

import { getStatsForUser } from "@/lib/stats";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  return Response.json(await getStatsForUser(userId));
}
