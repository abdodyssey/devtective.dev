import type { GitHubRepo } from "@/types/github";
import { CaseItem } from "./case-item";
import { Button } from "./ui/button";
import { ExternalLink } from "lucide-react";

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
          <Button className="flex gap-2 items-center" variant="ghost" href="https://github.com/abdodyssey?tab=repositories">
            Lihat semua proyek di GitHub <ExternalLink size={14}/>
          </Button>
        </div>
      )}
    </div>
  );
}
