"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";

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
  heroImage: string;
  heroName: string;
  heroHeadline: string;
  heroDescription: string;
  bio: string;
  interests: string[];
  stack: string[];
};

export async function getPortfolioData(): Promise<PortfolioData> {
  const filePath = path.join(process.cwd(), "src/content/about.json");
  const defaultStack = [
    "Next.js", "React", "TypeScript", "Tailwind CSS", 
    "Supabase", "PostgreSQL", "Docker", "Agentic AI", 
    "Node.js", "Python", "Linux", "Vercel",
    "Git & GitHub", "REST APIs", "GraphQL", "Prisma ORM",
    "Redis", "Cloudflare", "Figma", "Jest",
    "Keystatic", "Framer Motion", "Biome",
    "LangChain", "LlamaIndex", "OpenAI API", "FastAPI"
  ];
  try {
    const fileContent = await fs.readFile(filePath, "utf-8");
    const parsed = JSON.parse(fileContent);
    return {
      heroImage: parsed.heroImage || "/pfp.webp",
      heroName: parsed.heroName || "M. Abdi Nugroho",
      heroHeadline: parsed.heroHeadline || "TECH ENTHUSIAST · ID",
      heroDescription: parsed.heroDescription || "Seseorang dengan rasa penasaran tinggi terhadap teknologi...",
      bio: parsed.bio || "",
      interests: parsed.interests || [],
      stack: parsed.stack && parsed.stack.length > 0 ? parsed.stack : defaultStack,
    };
  } catch (error) {
    console.error("Failed to read portfolio data:", error);
    return { 
      heroImage: "/pfp.webp",
      heroName: "M. Abdi Nugroho", 
      heroHeadline: "TECH ENTHUSIAST · ID", 
      heroDescription: "", 
      bio: "", 
      interests: [], 
      stack: defaultStack
    };
  }
}

export async function updatePortfolioData(data: PortfolioData): Promise<{ success: boolean }> {
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.get("portfolio_session")?.value === "authenticated";
  if (!isAuthenticated) {
    throw new Error("Unauthorized");
  }

  const filePath = path.join(process.cwd(), "src/content/about.json");
  
  // Ensure directory exists
  await fs.mkdir(path.dirname(filePath), { recursive: true });

  // Write file
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");

  // Revalidate routes to update homepage
  revalidatePath("/");
  revalidatePath("/portfolio");

  return { success: true };
}

export async function uploadPortfolioImage(formData: FormData): Promise<{ success: boolean; url: string; error?: string }> {
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.get("portfolio_session")?.value === "authenticated";
  if (!isAuthenticated) {
    return { success: false, url: "", error: "Unauthorized" };
  }

  const file = formData.get("file") as File | null;
  if (!file) {
    return { success: false, url: "", error: "No file provided" };
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return { success: false, url: "", error: "Format tidak didukung. Gunakan JPG, PNG, GIF, atau WebP." };
  }

  if (file.size > 5 * 1024 * 1024) {
    return { success: false, url: "", error: "File terlalu besar. Maksimal 5MB." };
  }

  const ext = file.name.split(".").pop() ?? "jpg";
  const uniqueName = `pfp-${Date.now()}.${ext}`;
  const uploadDir = path.join(process.cwd(), "public");

  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(uploadDir, uniqueName), buffer);

  // We save it directly to /public, so the URL is just /filename
  return { success: true, url: `/${uniqueName}` };
}
