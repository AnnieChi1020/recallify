import { auth } from "@clerk/nextjs/server";

export default async function DashboardPage() {
  await auth.protect();

  return (
    <main className="flex flex-1 flex-col items-center justify-center">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="mt-2 text-zinc-500">You are signed in.</p>
    </main>
  );
}
