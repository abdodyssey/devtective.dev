"use client";

import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { ArrowRight, ExternalLink } from "lucide-react";

interface HeroProps {
  githubUsername: string;
  name: string;
  headline: string;
  description: string;
}

export function Hero({ githubUsername, name, headline, description }: HeroProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.45,
        ease: "easeOut",
      },
    },
  } as const;

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="pt-24 pb-16 max-w-3xl mx-auto px-6 md:px-8 flex flex-col"
    >
      <div className="flex flex-col-reverse md:flex-row md:items-center justify-between gap-6 mb-2">
        <div className="flex-1">
          <motion.div
            variants={itemVariants}
            className="font-mono text-[10px] tracking-[0.15em] text-text-muted uppercase mb-4"
          >
            {headline}
          </motion.div>
          <motion.h1
            variants={itemVariants}
            className="font-sans text-4xl md:text-5xl font-bold text-text-primary leading-tight"
          >
            {name}
          </motion.h1>
        </div>
      </div>
      <motion.p
        variants={itemVariants}
        className="font-sans text-base text-text-secondary mt-4 max-w-lg leading-relaxed whitespace-pre-wrap"
      >
        {description}
      </motion.p>
      <motion.div variants={itemVariants} className="flex flex-row gap-3 mt-8">
        <Button variant="primary" href="#projects" className="gap-2">
          Lihat Projects <ArrowRight size={14}/>
        </Button>
        <Button variant="ghost" href={`https://github.com/${githubUsername}`} className="flex items-center gap-1.5">
          GitHub <ExternalLink className="w-3.5 h-3.5" />
        </Button>
      </motion.div>
    </motion.section>
  );
}
