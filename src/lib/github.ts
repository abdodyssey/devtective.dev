import type { GitHubRepo } from "@/types/github";

const MOCK_REPOS: GitHubRepo[] = [
  {
    id: 1,
    name: "goskripsi",
    full_name: "abdodyssey/goskripsi",
    description: "Sistem Administrasi Skripsi Mahasiswa UIN Raden Fatah.",
    html_url: "https://github.com/abdodyssey/goskripsi",
    homepage: "https://goskripsi.dev",
    topics: ["nextjs", "typescript", "prisma", "postgresql", "portfolio"],
    stargazers_count: 5,
    forks_count: 2,
    language: "TypeScript",
    archived: false,
    pushed_at: "2026-05-30T12:00:00Z",
    created_at: "2025-01-01T00:00:00Z",
    fork: false,
  },
  {
    id: 2,
    name: "cbt-portal",
    full_name: "abdodyssey/cbt-portal",
    description: "Computer Based Test Portal for academic examinations.",
    html_url: "https://github.com/abdodyssey/cbt-portal",
    homepage: null,
    topics: ["react", "nodejs", "express", "mongodb", "portfolio"],
    stargazers_count: 8,
    forks_count: 1,
    language: "JavaScript",
    archived: false,
    pushed_at: "2026-05-15T12:00:00Z",
    created_at: "2025-02-01T00:00:00Z",
    fork: false,
  },
  {
    id: 3,
    name: "voksi",
    full_name: "abdodyssey/voksi",
    description: "Vocation and Skill Development platform for students.",
    html_url: "https://github.com/abdodyssey/voksi",
    homepage: "https://voksi.id",
    topics: ["django", "react", "tailwindcss", "voksi"],
    stargazers_count: 12,
    forks_count: 3,
    language: "Python",
    archived: false,
    pushed_at: "2026-04-20T12:00:00Z",
    created_at: "2025-03-01T00:00:00Z",
    fork: false,
  },
];

export async function getRepos(): Promise<GitHubRepo[]> {
  const username = process.env.GITHUB_USERNAME || "devtective";
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  try {
    const res = await fetch(
      `https://api.github.com/users/${username}/repos?sort=updated&per_page=20&type=public`,
      {
        cache: "no-store",
        headers,
      },
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch repos: ${res.statusText}`);
    }
    return (await res.json()) as GitHubRepo[];
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.warn("GitHub API error, falling back to mock data:", msg);
    return MOCK_REPOS;
  }
}

export async function getRepo(slug: string): Promise<GitHubRepo> {
  const username = process.env.GITHUB_USERNAME || "devtective";
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  try {
    const res = await fetch(
      `https://api.github.com/repos/${username}/${slug}`,
      {
        cache: "no-store",
        headers,
      },
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch repo ${slug}: ${res.statusText}`);
    }
    return (await res.json()) as GitHubRepo;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.warn(
      `GitHub API error fetching repo ${slug}, falling back to mock data:`,
      msg,
    );
    const mock = MOCK_REPOS.find(
      (r) => r.name.toLowerCase() === slug.toLowerCase(),
    );
    if (mock) return mock;

    return {
      id: Math.floor(Math.random() * 100000),
      name: slug,
      full_name: `${username}/${slug}`,
      description: "Project oleh M. Abdi Nugroho.",
      html_url: `https://github.com/${username}/${slug}`,
      homepage: null,
      topics: ["nextjs", "typescript"],
      stargazers_count: 0,
      forks_count: 0,
      language: "TypeScript",
      archived: false,
      pushed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      fork: false,
    };
  }
}

export async function getRepoReadme(slug: string): Promise<string | null> {
  const username = process.env.GITHUB_USERNAME || "devtective";
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  try {
    const res = await fetch(
      `https://api.github.com/repos/${username}/${slug}/readme`,
      {
        cache: "no-store",
        headers,
      },
    );
    if (!res.ok) throw new Error("Readme not found");
    const data = await res.json();
    if (data.content && data.encoding === "base64") {
      const cleanContent = data.content.replace(/\s/g, "");
      return Buffer.from(cleanContent, "base64").toString("utf-8");
    }
    return null;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.warn(
      `GitHub API error fetching readme for ${slug}, falling back to mock:`,
      msg,
    );
    return `# ${slug.toUpperCase()}

## Overview
Deskripsi project untuk ${slug}.

## Development
Project ini dibangun menggunakan teknologi web modern.

## Lisensi
MIT License.`;
  }
}
