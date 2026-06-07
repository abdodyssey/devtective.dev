import { cookies } from "next/headers";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { calculateJournalStreak, calculateAchievements } from "@/lib/journal-utils";
import { JournalWorkspace } from "./journal-workspace";
import { getVisitorStats } from "./comment-actions";
import { getAllJournalEntries } from "./actions";

export default async function JournalPage() {
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.get("journal_session")?.value === "authenticated";
  const githubUsername = process.env.GITHUB_USERNAME || "abdodyssey";

  let posts: any[] = [];
  try {
    posts = await getAllJournalEntries();
  } catch (error) {
    console.error("Failed to load journal entries:", error);
  }

  // Filter posts based on authentication status
  const visiblePosts = isAuthenticated
    ? posts
    : posts.filter((post) => post.entry.isPrivate === false);

  // Calculate streak stats from all posts (not just visible - for owner accuracy)
  const allDates = posts.map((post) => post.entry.date).filter(Boolean) as string[];
  const streakInfo = calculateJournalStreak(allDates);

  // Compute achievement badges
  const achievements = calculateAchievements(
    posts.map((p) => ({ date: p.entry.date })),
    streakInfo
  );

  // Visitor stats (only fetched for authenticated owner)
  const visitorStats = isAuthenticated ? await getVisitorStats() : null;

  // Map posts to a fully serializable structure
  const serializablePosts = visiblePosts.map((post) => ({
    slug: post.slug,
    entry: {
      title: post.entry.title,
      date: post.entry.date,
      isPrivate: post.entry.isPrivate ?? true,
    },
  }));

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary text-text-secondary select-none">
      <Nav />
      <main className="flex-1 w-full">
        <JournalWorkspace
          posts={serializablePosts}
          streakInfo={streakInfo}
          achievements={achievements}
          visitorStats={visitorStats}
          isAuthenticated={isAuthenticated}
        />
      </main>
      <Footer githubUsername={githubUsername} />
    </div>
  );
}
