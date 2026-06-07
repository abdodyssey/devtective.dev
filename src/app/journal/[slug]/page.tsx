import { cookies } from "next/headers";
import { createReader } from "@keystatic/core/reader";
import keystaticConfig from "../../../../keystatic.config";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { LockButton } from "../lock-button";
import { DocumentRenderer } from "@keystatic/core/renderer";
import Link from "next/link";
import { Calendar, ArrowLeft, Lock, Users, Eye, Clock } from "lucide-react";
import { notFound } from "next/navigation";
import { getComments, getVisitorStats } from "../comment-actions";
import { CommentSection } from "../comment-section";
import { LoginForm } from "../login-form";

const reader = createReader(process.cwd(), keystaticConfig);

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function JournalPostPage({ params }: PageProps) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.get("journal_session")?.value === "authenticated";
  const githubUsername = process.env.GITHUB_USERNAME || "abdodyssey";

  let post = null;
  try { post = await reader.collections.journal.read(slug); }
  catch (error) { console.error("Failed to load journal post:", error); }

  if (!post) notFound();

  const isPostPrivate = post.isPrivate ?? true;
  if (isPostPrivate && !isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-bg-primary text-text-secondary select-none">
        <Nav />
        <main className="flex-1 w-full pt-16">
          <LoginForm />
        </main>
        <Footer githubUsername={githubUsername} />
      </div>
    );
  }

  const formattedDate = post.date
    ? new Date(post.date).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })
    : "Tanggal tidak diketahui";

  const content = await post.content();

  // Load comments + visitor stats in parallel
  const [initialComments, visitorStats] = await Promise.all([
    getComments(slug),
    isAuthenticated ? getVisitorStats() : Promise.resolve(null),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary text-text-secondary select-none">
      <Nav />
      <main className="flex-1 w-full pt-28 pb-16 max-w-3xl mx-auto px-6 md:px-8">



        {/* Header nav */}
        <div className="flex items-center justify-between border-b border-border-default pb-4 mb-8">
          <Link href="/journal" className="flex items-center gap-1.5 font-mono text-xs text-text-muted hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 rounded-sm transition-all">
            <ArrowLeft className="w-3.5 h-3.5" /> BACK TO JOURNAL
          </Link>
          {isAuthenticated ? (
            <LockButton />
          ) : (
            <Link href="/journal"
              className="flex items-center gap-1.5 bg-bg-surface border border-border-default hover:border-text-primary text-text-muted hover:text-text-primary font-mono text-[9px] px-2.5 py-1 rounded font-bold transition-all">
              <Lock className="w-3 h-3" /> UNLOCK PRIVATE
            </Link>
          )}
        </div>

        {/* Article */}
        <article className="space-y-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-sans text-3xl md:text-4xl font-bold text-text-primary tracking-tight leading-tight">
                {post.title}
              </h1>
              {isAuthenticated && post.isPrivate && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-500 font-mono text-[8px] font-bold">
                  <Lock className="w-2 h-2" /> PRIVATE
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 font-mono text-[11px] text-text-muted">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> {formattedDate}
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> 
                {Math.max(1, Math.ceil(JSON.stringify(content).replace(/[{}[\]":\\]/g, '').split(/\s+/).length / 200))} min read
              </div>
            </div>
          </div>

          <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none font-sans text-text-secondary leading-relaxed space-y-4 pt-4 border-t border-border-default">
            <DocumentRenderer document={content} />
          </div>
        </article>

        {/* Visitor Analytics Banner (owner only) - Moved to bottom */}
        {isAuthenticated && visitorStats && visitorStats.totalUnique > 0 && (
          <div className="mt-12 mb-6 p-4 bg-bg-surface border border-border-default rounded-lg">
            <div className="flex items-center gap-2 mb-3 font-mono text-xs text-text-muted uppercase tracking-wider font-bold">
              <Users className="w-4 h-4" />
              Visitor Insights
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[11px] text-text-muted uppercase">Unique:</span>
                <span className="font-mono text-xs font-bold text-text-primary">{visitorStats.totalUnique}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[11px] text-text-muted uppercase">Total Visits:</span>
                <span className="font-mono text-xs font-bold text-text-primary">{visitorStats.totalVisits}</span>
              </div>
              <div className="w-px h-4 bg-border-default mx-1"></div>
              {visitorStats.visitors.slice(0, 5).map((v, i) => (
                <div key={i} className="flex items-center gap-1.5 bg-bg-primary border border-border-default rounded-full px-2.5 py-1">
                  <span className="font-mono text-[11px] font-bold text-text-secondary">{v.name}</span>
                  <span className="font-mono text-[10px] text-text-placeholder">{v.visitCount}x</span>
                </div>
              ))}
              {visitorStats.totalUnique > 5 && (
                <span className="font-mono text-[11px] text-text-placeholder">+{visitorStats.totalUnique - 5} lainnya</span>
              )}
            </div>
          </div>
        )}

        {/* Comments — only on public posts or when logged in */}
        {!isPostPrivate || isAuthenticated ? (
          <CommentSection
            slug={slug}
            initialComments={initialComments}
            isAuthenticated={isAuthenticated}
          />
        ) : null}
      </main>
      <Footer githubUsername={githubUsername} />
    </div>
  );
}
