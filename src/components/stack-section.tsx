"use client";

import { motion } from "framer-motion";
import { TechTag } from "./ui/badge";
import { SectionLabel } from "./ui/section-label";

interface StackSectionProps {
  tools: readonly string[];
}

export function StackSection({ tools }: StackSectionProps) {

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.05,
      },
    },
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.92, y: 5 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
      },
    },
  } as const;

  return (
    <motion.section
      id="stack"
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="border-t border-border-default py-16 max-w-3xl mx-auto px-6 md:px-8"
    >
      <SectionLabel label="TOOLS & TECHNOLOGIES" />
      <div className="mt-6">
        <p className="font-sans text-sm text-text-secondary">
          Perangkat lunak, framework, dan layanan yang saya gunakan untuk menunjang produktivitas dan pengembangan.
        </p>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="flex flex-wrap gap-2 mt-4"
        >
          {tools.map((tool) => (
            <motion.div key={tool} variants={itemVariants}>
              <TechTag>{tool}</TechTag>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}
