import type { GitHubRepo } from "@/types/github";
import { CaseItem } from "./case-item";
import { Button } from "./ui/button";

interface CaseManifestProps {
  repos: GitHubRepo[];
}

export function CaseManifest({ repos }: CaseManifestProps) {
  return (
    <div className="flex flex-col mt-6">
      {/* Rows */}
      <div className="flex flex-col">
        {repos.slice(0, 5).map((repo) => (
          <CaseItem key={repo.id} repo={repo} />
        ))}
      </div>
      
      {repos.length > 5 && (
        <div className="mt-4 pt-4 border-t border-border-default text-center">
          <Button variant="ghost" href="https://github.com/abdodyssey?tab=repositories">
            Lihat semua proyek di GitHub ↗
          </Button>
        </div>
      )}
    </div>
  );
}
