"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { put } from "@vercel/blob";
import Redis from "ioredis";

const redis = process.env.KV_REDIS_URL ? new Redis(process.env.KV_REDIS_URL) : null;

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

// ── Redis Storage Interface ──────────────────────────────────────────────────

export interface JournalEntry {
  slug: string;
  title: string;
  date: string;
  isPrivate: boolean;
  content: string;
}

export async function getAllJournalEntries(): Promise<{ slug: string; entry: { title: string; date: string; isPrivate: boolean } }[]> {
  if (!redis) return [];
  try {
    const data = await redis.hgetall("journal_entries");
    return Object.values(data).map(json => {
      const parsed = JSON.parse(json) as JournalEntry;
      return {
        slug: parsed.slug,
        entry: {
          title: parsed.title,
          date: parsed.date,
          isPrivate: parsed.isPrivate,
        }
      };
    }).sort((a, b) => new Date(b.entry.date).getTime() - new Date(a.entry.date).getTime());
  } catch (e) {
    console.error("Failed to load journals from redis:", e);
    return [];
  }
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
  if (!isAuthenticated) throw new Error("Unauthorized");
  if (!redis) throw new Error("Redis not configured");

  const slug = existingSlug || generateSlug(title);
  
  const entryData: JournalEntry = {
    slug,
    title,
    date,
    isPrivate,
    content: content.trim()
  };

  await redis.hset("journal_entries", slug, JSON.stringify(entryData));

  revalidatePath("/journal");
  revalidatePath(`/journal/${slug}`);

  return { success: true, slug };
}

export async function deleteJournalEntry(slug: string): Promise<boolean> {
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.get("journal_session")?.value === "authenticated";
  if (!isAuthenticated) throw new Error("Unauthorized");
  if (!redis) return false;

  try {
    await redis.hdel("journal_entries", slug);
    // Also delete associated comments
    await redis.del(`comments:${slug}`);
    revalidatePath("/journal");
    return true;
  } catch (error) {
    console.error("Failed to delete entry:", error);
    return false;
  }
}

export async function getRawJournalContent(slug: string): Promise<string> {
  // Now returns the JournalEntry stringified or just content
  // Since our UI expects raw content string:
  if (!redis) return "";
  try {
    const data = await redis.hget("journal_entries", slug);
    if (!data) return "";
    const parsed = JSON.parse(data) as JournalEntry;
    return parsed.content;
  } catch (error) {
    console.error("Error reading raw journal:", error);
    return "";
  }
}

export async function getFullJournalEntry(slug: string): Promise<JournalEntry | null> {
  if (!redis) return null;
  try {
    const data = await redis.hget("journal_entries", slug);
    if (!data) return null;
    return JSON.parse(data) as JournalEntry;
  } catch (error) {
    return null;
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

