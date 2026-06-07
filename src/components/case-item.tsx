import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { GitHubRepo } from "@/types/github";

interface CaseItemProps {
  repo: GitHubRepo;
}

export function CaseItem({ repo }: CaseItemProps) {
  return (
    <Link
      href={`/projects/${repo.name}`}
      className="flex items-center justify-between py-3 border-b border-border-default last:border-b-0 hover:bg-bg-surface focus-visible:outline-none focus-visible:bg-bg-surface focus-visible:ring-2 focus-visible:ring-accent/30 transition-all duration-150 group px-3 -mx-3 rounded"
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-2">
            <span className="font-sans text-sm md:text-base font-bold text-text-primary group-hover:text-accent transition-colors duration-150 truncate">
              {repo.name}
            </span>
          </div>
          {repo.description && (
            <p className="font-mono text-[11px] text-text-muted mt-1 line-clamp-2 pr-4 leading-relaxed">
              {repo.description}
            </p>
          )}
        </div>
      </div>
      <div className="text-text-placeholder group-hover:text-accent transition-colors duration-150 pr-1 flex-shrink-0">
        <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform duration-150" />
      </div>
    </Link>
  );
}
