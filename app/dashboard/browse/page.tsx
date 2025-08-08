import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { BrowseStories } from "./_components/browse-stories";

export default async function BrowsePage() {
  const result = await auth.api.getSession({
    headers: await headers(),
  });

  if (!result?.session?.userId) {
    redirect("/sign-in");
  }


  return (
    <section className="flex flex-col items-start justify-start p-6 w-full max-w-7xl mx-auto">
      <div className="w-full">
        <div className="flex flex-col items-start justify-center gap-2 mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">
            Browse Stories
          </h1>
          <p className="text-muted-foreground">
            Discover new fanfiction stories from Archive of Our Own
          </p>
        </div>

        <BrowseStories />
      </div>
    </section>
  );
}