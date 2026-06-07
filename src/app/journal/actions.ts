"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
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
  const filePath = path.join(process.cwd(), "src/content/journal", `${slug}.mdoc`);

  // Format frontmatter and body exactly like Keystatic output
  const fileContent = `---
title: ${title}
date: ${date}
isPrivate: ${isPrivate}
---
${content.trim()}
`;

  // Ensure directory exists
  await fs.mkdir(path.dirname(filePath), { recursive: true });

  // Write file
  await fs.writeFile(filePath, fileContent, "utf-8");

  // Revalidate routes to update layout and lists
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

  const filePath = path.join(process.cwd(), "src/content/journal", `${slug}.mdoc`);
  try {
    await fs.unlink(filePath);
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

  const filePath = path.join(process.cwd(), "src/content/journal", `${slug}.mdoc`);
  const fileContent = await fs.readFile(filePath, "utf-8");
  const parts = fileContent.split("---");
  return parts.slice(2).join("---").trim();
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

  // Validate file type
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
  if (!allowedTypes.includes(file.type)) {
    return { success: false, url: "", error: "File type not supported. Use JPG, PNG, GIF, WebP, or SVG." };
  }

  // Max 5MB
  if (file.size > 5 * 1024 * 1024) {
    return { success: false, url: "", error: "File too large. Max 5MB." };
  }

  // Generate unique filename to avoid collisions
  const ext = file.name.split(".").pop() ?? "jpg";
  const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "journal-images");

  await fs.mkdir(uploadDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(uploadDir, uniqueName), buffer);

  return { success: true, url: `/journal-images/${uniqueName}` };
}

