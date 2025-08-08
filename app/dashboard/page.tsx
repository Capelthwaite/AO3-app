import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardContent } from "./_components/dashboard-content";

export default async function Dashboard() {
  const result = await auth.api.getSession({
    headers: await headers(),
  });

  if (!result?.session?.userId) {
    redirect("/sign-in");
  }

  const user = result.user;

  return (
    <section className="flex flex-col items-start justify-start p-6 w-full max-w-4xl mx-auto">
      <div className="w-full">
        <div className="flex flex-col items-start justify-center gap-2 mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-muted-foreground">
            Manage your AO3 reading library and discover new stories
          </p>
        </div>

        <DashboardContent />
      </div>
    </section>
  );
}
