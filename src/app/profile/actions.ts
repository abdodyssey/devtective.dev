"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { put } from "@vercel/blob";
import Redis from "ioredis";

const redis = process.env.KV_REDIS_URL ? new Redis(process.env.KV_REDIS_URL) : null;

export async function verifyAndUnlockPortfolio(password: string): Promise<boolean> {
  const correctPassword = process.env.JOURNAL_PASSWORD || "devtective";
  if (password === correctPassword) {
    const cookieStore = await cookies();
    cookieStore.set("portfolio_session", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });
    return true;
  }
  return false;
}

export async function lockPortfolio(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("portfolio_session");
}

export type PortfolioData = {
  heroName: string;
  heroHeadline: string;
  heroDescription: string;
  bio: string;
  interests: string[];
  stack: string[];
};

export async function getPortfolioData(): Promise<PortfolioData> {
  const defaultStack = [
    "Next.js", "React", "TypeScript", "Tailwind CSS", 
    "Supabase", "PostgreSQL", "Docker", "Agentic AI", 
    "Node.js", "Python", "Linux", "Vercel",
    "Git & GitHub", "REST APIs", "GraphQL", "Prisma ORM",
    "Redis", "Cloudflare", "Figma", "Jest",
    "Keystatic", "Framer Motion", "Biome",
    "LangChain", "LlamaIndex", "OpenAI API", "FastAPI"
  ];
  const defaults = {
    heroName: "M. Abdi Nugroho",
    heroHeadline: "TECH ENTHUSIAST · ID",
    heroDescription: "Seseorang dengan rasa penasaran tinggi terhadap teknologi...",
    bio: "",
    interests: [],
    stack: defaultStack,
  };

  try {
    if (!redis) throw new Error("Redis not configured");
    const dataStr = await redis.get("portfolio:about");
    if (!dataStr) return defaults;
    
    const parsed = JSON.parse(dataStr);
    return {
      heroName: parsed.heroName || defaults.heroName,
      heroHeadline: parsed.heroHeadline || defaults.heroHeadline,
      heroDescription: parsed.heroDescription || defaults.heroDescription,
      bio: parsed.bio || defaults.bio,
      interests: parsed.interests || defaults.interests,
      stack: parsed.stack && parsed.stack.length > 0 ? parsed.stack : defaults.stack,
    };
  } catch (error) {
    console.error("Failed to read portfolio data from Redis:", error);
    return defaults;
  }
}

export async function updatePortfolioData(data: PortfolioData): Promise<{ success: boolean }> {
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.get("portfolio_session")?.value === "authenticated";
  if (!isAuthenticated) {
    throw new Error("Unauthorized");
  }

  if (!redis) throw new Error("Redis not configured");

  // Write to Redis
  await redis.set("portfolio:about", JSON.stringify(data));

  // Revalidate routes
  revalidatePath("/");
  revalidatePath("/profile");

  return { success: true };
}
