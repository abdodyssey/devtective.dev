"use client";

import { motion } from "framer-motion";
import type { GitHubRepo } from "@/types/github";
import { CaseManifest } from "./case-manifest";
import { SectionLabel } from "./ui/section-label";

interface CaseFilesProps {
  repos: GitHubRepo[];
}

export function CaseFiles({ repos }: CaseFilesProps) {
  return (
    <motion.section
      id="projects"
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="border-t border-border-default py-16 max-w-3xl mx-auto px-6 md:px-8"
    >
      <SectionLabel label="PROJECTS" />
      <div className="mt-6">
        <p className="font-sans text-sm text-text-secondary">
          Beberapa project yang pernah saya kerjakan.
        </p>
        <CaseManifest repos={repos} />
      </div>
    </motion.section>
  );
}
