import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { TechTag } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionLabel } from "@/components/ui/section-label";
import { getRepo, getRepoReadme, getRepos } from "@/lib/github";
import { formatDate, sortRepos } from "@/lib/utils";

import type { GitHubRepo } from "@/types/github";
import { ExternalLink } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const repos = await getRepos();
    const sorted = sortRepos(repos);
    return sorted.map((r) => ({ slug: r.name }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const repo = await getRepo(slug);
    return {
      title: repo.name,
      description: repo.description ?? "Project oleh M. Abdi Nugroho.",
    };
  } catch {
    return {
      title: "Project Not Found",
      description: "Specified project file could not be retrieved.",
    };
  }
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;

  let repo: GitHubRepo;
  let readme: string | null = null;
  const githubUsername = process.env.GITHUB_USERNAME || "abdodyssey";

  try {
    repo = await getRepo(slug);

    // Attempt to fetch readme content
    readme = await getRepoReadme(slug);
  } catch {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary text-text-secondary select-none">
      <Nav />
      <main className="flex-1 max-w-3xl mx-auto px-6 md:px-8 py-16 w-full">
        {/* Back Link */}
        <Link
          href="/#projects"
          className="font-mono text-xs text-text-muted hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 rounded-sm transition-colors duration-150 inline-block"
        >
          ← Projects
        </Link>

        {/* Title and Description */}
        <h1 className="font-sans text-3xl md:text-4xl font-bold text-text-primary mt-8">
          {repo.name}
        </h1>
        <p className="font-sans text-base text-text-secondary mt-2 leading-relaxed">
          {repo.description ?? "Belum ada deskripsi untuk project ini."}
        </p>

        {/* Metadata Row */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 font-mono text-[11px] text-text-placeholder uppercase">
          <span>LANGUAGE: {repo.language || "NONE"}</span>
          <span>·</span>
          <span>FORKS: {repo.forks_count}</span>
          <span>·</span>
          <span>UPDATED: {formatDate(repo.pushed_at)}</span>
        </div>

        {/* Tech Tags */}
        {repo.topics.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {repo.topics.map((topic) => (
              <TechTag key={topic}>{topic}</TechTag>
            ))}
          </div>
        )}

        {/* CTA Buttons */}
        <div className="flex gap-3 mt-6">
          <Button variant="primary" href={repo.html_url}>
            View on GitHub →
          </Button>
          {repo.homepage && (
            <Button variant="outline" href={repo.homepage} className="flex items-center gap-1.5">
              Live Demo <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-border-default my-8" />

        {/* README Section */}
        {readme && (
          <div className="space-y-4">
            <SectionLabel label="README.MD" />
            <div className="bg-bg-surface border border-border-default p-5 rounded font-mono text-xs text-text-secondary overflow-x-auto whitespace-pre-wrap leading-relaxed select-text">
              {readme}
            </div>
          </div>
        )}
      </main>
      <Footer githubUsername={githubUsername} />
    </div>
  );
}
