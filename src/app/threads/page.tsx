import { cookies } from "next/headers";
import { createReader } from "@keystatic/core/reader";
import keystaticConfig from "../../../keystatic.config";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { ThreadsWorkspace } from "./threads-workspace";

const reader = createReader(process.cwd(), keystaticConfig);

export default async function ThreadsPage() {
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.get("journal_session")?.value === "authenticated";
  const githubUsername = process.env.GITHUB_USERNAME || "abdodyssey";

  let threads: any[] = [];
  try {
    threads = await reader.collections.threads.all();
    threads.sort((a, b) => {
      const dateA = new Date(a.entry.date || 0);
      const dateB = new Date(b.entry.date || 0);
      return dateB.getTime() - dateA.getTime();
    });
  } catch (error) {
    console.error("Failed to load threads:", error);
  }

  // Filter posts based on authentication status
  const visibleThreads = isAuthenticated
    ? threads
    : threads.filter((thread) => thread.entry.isPrivate === false);

  // Map to fully serializable and resolved content
  const serializableThreads = await Promise.all(
    visibleThreads.map(async (thread) => {
      // the content is a document nodes array, we can pass it down
      const rawContent = await thread.entry.content();
      return {
        id: thread.slug,
        entry: {
          date: thread.entry.date,
          isPrivate: thread.entry.isPrivate ?? false,
          content: rawContent,
        },
      };
    })
  );

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary text-text-secondary select-none">
      <Nav />
      <main className="flex-1 w-full">
        <ThreadsWorkspace 
          threads={serializableThreads}
          isAuthenticated={isAuthenticated}
        />
      </main>
      <Footer githubUsername={githubUsername} />
    </div>
  );
}
