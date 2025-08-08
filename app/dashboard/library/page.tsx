import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { StoryLibrary } from "@/app/dashboard/_components/story-library";

export default async function LibraryPage() {
  const result = await auth.api.getSession({
    headers: await headers(),
  });

  if (!result?.session?.userId) {
    redirect("/sign-in");
  }

  return (
    <section className="flex flex-col items-start justify-start p-6 w-full max-w-7xl mx-auto">
      <div className="w-full">
        <StoryLibrary />
      </div>
    </section>
  );
}