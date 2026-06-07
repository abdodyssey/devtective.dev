import { About } from "@/components/about";
import { CaseFiles } from "@/components/case-files";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/hero";
import { Nav } from "@/components/nav";
import { StackSection } from "@/components/stack-section";
import { getRepos } from "@/lib/github";
import { sortRepos } from "@/lib/utils";
import type { GitHubRepo } from "@/types/github";
import { createReader } from "@keystatic/core/reader";
import keystaticConfig from "../../keystatic.config";
import { getPortfolioData } from "@/app/profile/actions";

const reader = createReader(process.cwd(), keystaticConfig);

export default async function Home() {
  const githubUsername = process.env.GITHUB_USERNAME || "abdodyssey";
  let repos: GitHubRepo[] = [];
  try {
    const rawRepos = await getRepos();
    repos = sortRepos(rawRepos);
  } catch (error) {
    console.error("Failed to load GitHub repositories:", error);
  }

  let aboutData = null;
  try {
    aboutData = await getPortfolioData();
  } catch (error) {
    console.error("Failed to read profile data from Redis:", error);
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary text-text-secondary select-none">
      <Nav />
      <main className="flex-1 w-full">
        <Hero 
          githubUsername={githubUsername} 
          heroImage={aboutData?.heroImage || "/pfp.webp"}
          name={aboutData?.heroName || "M. Abdi Nugroho"}
          headline={aboutData?.heroHeadline || "TECH ENTHUSIAST · ID"}
          description={aboutData?.heroDescription || "Seseorang dengan rasa penasaran tinggi terhadap teknologi..."}
        />
        <About
          bio={aboutData?.bio}
          interests={aboutData?.interests}
        />
        <CaseFiles repos={repos} />
        <StackSection tools={aboutData?.stack || []} />
      </main>
      <Footer githubUsername={githubUsername} />
    </div>
  );
}
