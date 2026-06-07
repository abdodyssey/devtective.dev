import { 
  GraduationCap, Briefcase, Coffee, BookOpen, 
  Globe, Monitor, Brain, Smartphone, FolderGit2,
  Terminal, Activity, Building2, Stethoscope, Languages, ShoppingBag, Book
} from "lucide-react";
import Link from "next/link";
import type { GitHubRepo } from "@/types/github";

interface CaseItemProps {
  repo: GitHubRepo;
}

function getRepoIcon(repo: GitHubRepo) {
  const name = repo.name.toLowerCase();
  const desc = (repo.description || "").toLowerCase();
  const topics = (repo.topics || []).join(" ").toLowerCase();
  
  const search = name + " " + desc + " " + topics;

  if (search.includes("skripsi") || search.includes("academic") || search.includes("university")) return GraduationCap;
  if (search.includes("coffee") || search.includes("cafe")) return Coffee;
  if (search.includes("nihongo") || search.includes("language") || search.includes("teacher")) return Languages;
  if (search.includes("voksi") || search.includes("lms") || search.includes("edukasi") || search.includes("tahfiz")) return BookOpen;
  if (search.includes("clinic") || search.includes("health") || search.includes("medical")) return Stethoscope;
  if (search.includes("pos") || search.includes("point of sale") || search.includes("shop")) return ShoppingBag;
  if (search.includes("ai") || search.includes("machine learning") || search.includes("mnist")) return Brain;
  if (search.includes("web") || search.includes("portal") || search.includes("hub")) return Globe;
  if (search.includes("cli") || search.includes("terminal")) return Terminal;
  
  return FolderGit2; // Default
}

export function CaseItem({ repo }: CaseItemProps) {
  const Icon = getRepoIcon(repo);

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
      <div className="text-text-muted group-hover:text-accent transition-colors duration-150 pr-1 flex-shrink-0">
        <Icon className="w-4 h-4 transform group-hover:scale-110 transition-transform duration-150" />
      </div>
    </Link>
  );
}
