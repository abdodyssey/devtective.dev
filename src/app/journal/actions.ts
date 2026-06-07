"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { put } from "@vercel/blob";
import fs from "fs/promises";
import path from "path";

export async function verifyAndUnlockJournal(password: string): Promise<boolean> {
  const correctPassword = process.env.JOURNAL_PASSWORD || "devtective";
  if (password === correctPassword) {
    const cookieStore = await cookies();
    cookieStore.set("journal_session", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });
    return true;
  }
  return false;
}

export async function lockJournal(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("journal_session");
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

// Helper to push commits directly to GitHub to bypass Vercel EROFS
async function commitToGitHub(filePath: string, content: string, message: string) {
  const token = process.env.GITHUB_TOKEN;
  const username = process.env.GITHUB_USERNAME || "abdodyssey";
  const repo = "devtective.dev";
  
  if (!token) throw new Error("GITHUB_TOKEN is missing. Please add it to your environment variables.");

  const url = `https://api.github.com/repos/${username}/${repo}/contents/${filePath}`;
  
  // 1. Get file SHA if it already exists
  const getRes = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github.v3+json" }
  });
  let sha = undefined;
  if (getRes.ok) {
    const data = await getRes.json();
    sha = data.sha;
  }

  // 2. Put file
  const putRes = await fetch(url, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github.v3+json" },
    body: JSON.stringify({
      message,
      content: Buffer.from(content).toString("base64"),
      sha
    })
  });

  if (!putRes.ok) {
    throw new Error(`GitHub commit failed: ${await putRes.text()}`);
  }
}

async function deleteFromGitHub(filePath: string, message: string) {
  const token = process.env.GITHUB_TOKEN;
  const username = process.env.GITHUB_USERNAME || "abdodyssey";
  const repo = "devtective.dev";
  
  if (!token) throw new Error("GITHUB_TOKEN is missing.");

  const url = `https://api.github.com/repos/${username}/${repo}/contents/${filePath}`;
  
  const getRes = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github.v3+json" }
  });
  if (!getRes.ok) throw new Error("File not found on GitHub");
  
  const data = await getRes.json();
  const sha = data.sha;

  const delRes = await fetch(url, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github.v3+json" },
    body: JSON.stringify({ message, sha })
  });

  if (!delRes.ok) throw new Error(`GitHub delete failed: ${await delRes.text()}`);
}

export async function createOrUpdateJournalEntry(
  existingSlug: string | null,
  title: string,
  date: string,
  isPrivate: boolean,
  content: string
): Promise<{ success: boolean; slug: string }> {
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.get("journal_session")?.value === "authenticated";
  if (!isAuthenticated) {
    throw new Error("Unauthorized");
  }

  const slug = existingSlug || generateSlug(title);
  const fileContent = `---
title: ${title}
date: ${date}
isPrivate: ${isPrivate}
---
${content.trim()}
`;

  // On Vercel, we must commit to GitHub so Keystatic can read it upon rebuild
  if (process.env.VERCEL) {
    await commitToGitHub(
      `src/content/journal/${slug}.mdoc`,
      fileContent,
      `docs: update journal entry ${slug}`
    );
  } else {
    // Local fallback
    const filePath = path.join(process.cwd(), "src/content/journal", `${slug}.mdoc`);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, fileContent, "utf-8");
  }

  revalidatePath("/journal");
  revalidatePath(`/journal/${slug}`);

  return { success: true, slug };
}

export async function deleteJournalEntry(slug: string): Promise<boolean> {
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.get("journal_session")?.value === "authenticated";
  if (!isAuthenticated) {
    throw new Error("Unauthorized");
  }

  try {
    if (process.env.VERCEL) {
      await deleteFromGitHub(`src/content/journal/${slug}.mdoc`, `docs: delete journal entry ${slug}`);
    } else {
      const filePath = path.join(process.cwd(), "src/content/journal", `${slug}.mdoc`);
      await fs.unlink(filePath);
    }
    revalidatePath("/journal");
    return true;
  } catch (error) {
    console.error("Failed to delete entry:", error);
    return false;
  }
}

export async function getRawJournalContent(slug: string): Promise<string> {
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.get("journal_session")?.value === "authenticated";
  if (!isAuthenticated) {
    throw new Error("Unauthorized");
  }

  try {
    if (process.env.VERCEL) {
      const token = process.env.GITHUB_TOKEN;
      const username = process.env.GITHUB_USERNAME || "abdodyssey";
      const url = `https://api.github.com/repos/${username}/devtective.dev/contents/src/content/journal/${slug}.mdoc`;
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}`, Accept: "application/vnd.github.v3.raw" } : { Accept: "application/vnd.github.v3.raw" },
        cache: 'no-store'
      });
      if (!res.ok) throw new Error("Not found on GitHub");
      const fileContent = await res.text();
      const parts = fileContent.split("---");
      return parts.slice(2).join("---").trim();
    } else {
      const filePath = path.join(process.cwd(), "src/content/journal", `${slug}.mdoc`);
      const fileContent = await fs.readFile(filePath, "utf-8");
      const parts = fileContent.split("---");
      return parts.slice(2).join("---").trim();
    }
  } catch (error) {
    console.error("Error reading raw journal:", error);
    return "";
  }
}

export async function uploadJournalImage(formData: FormData): Promise<{ success: boolean; url: string; error?: string }> {
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.get("journal_session")?.value === "authenticated";
  if (!isAuthenticated) {
    return { success: false, url: "", error: "Unauthorized" };
  }

  const file = formData.get("file") as File | null;
  if (!file) {
    return { success: false, url: "", error: "No file provided" };
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
  if (!allowedTypes.includes(file.type)) {
    return { success: false, url: "", error: "File type not supported." };
  }

  if (file.size > 5 * 1024 * 1024) {
    return { success: false, url: "", error: "File too large. Max 5MB." };
  }

  try {
    const ext = file.name.split(".").pop() ?? "jpg";
    const uniqueName = `journal-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    
    // Always use Vercel Blob for images for consistency
    const blob = await put(uniqueName, file, {
      access: 'public',
      addRandomSuffix: false
    });

    return { success: true, url: blob.url };
  } catch (error) {
    console.error("Journal image upload failed:", error);
    return { success: false, url: "", error: "Gagal mengunggah gambar ke Vercel Blob." };
  }
}

