import type { GitHubRepo } from "@/types/github";

export function getRepoStatus(
  repo: GitHubRepo,
): "IN PROGRESS" | "SHIPPED" | "ARCHIVED" | "ON HOLD" {
  if (repo.archived) return "ARCHIVED";

  const lastPush = new Date(repo.pushed_at);
  const now = new Date();
  const daysSinceUpdate =
    (now.getTime() - lastPush.getTime()) / (1000 * 60 * 60 * 24);

  if (repo.topics.includes("active") || daysSinceUpdate < 30)
    return "IN PROGRESS";
  if (repo.topics.includes("on-hold")) return "ON HOLD";
  if (daysSinceUpdate > 180) return "ARCHIVED";
  return "SHIPPED";
}

export function sortRepos(repos: GitHubRepo[]): GitHubRepo[] {
  return repos
    .filter(
      (r) =>
        !r.fork &&
        (r.topics.includes("voksi-portfolio") ||
          r.topics.includes("portfolio")),
    )
    .sort((a, b) => {
      const aFeatured = a.topics.includes("featured") ? 1 : 0;
      const bFeatured = b.topics.includes("featured") ? 1 : 0;
      if (bFeatured !== aFeatured) return bFeatured - aFeatured;
      return new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime();
    });
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
