"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";

export async function createThread(
  content: string,
  isPrivate: boolean
): Promise<{ success: boolean; id?: string; error?: string }> {
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.get("journal_session")?.value === "authenticated";
  if (!isAuthenticated) {
    return { success: false, error: "Unauthorized" };
  }

  // Generate ID based on current timestamp
  const now = new Date();
  const id = now.toISOString().replace(/[:.]/g, "-");
  const filePath = path.join(process.cwd(), "src/content/threads", `${id}.mdoc`);

  // Format frontmatter and body exactly like Keystatic output
  // Keystatic datetime field expects YYYY-MM-DDTHH:mm format
  const dateStr = now.toISOString().slice(0, 16);
  
  const fileContent = `---
id: ${id}
date: '${dateStr}'
isPrivate: ${isPrivate}
---
${content.trim()}
`;

  // Ensure directory exists
  await fs.mkdir(path.dirname(filePath), { recursive: true });

  // Write file
  await fs.writeFile(filePath, fileContent, "utf-8");

  // Revalidate routes
  revalidatePath("/threads");

  return { success: true, id };
}

export async function deleteThread(id: string): Promise<boolean> {
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.get("journal_session")?.value === "authenticated";
  if (!isAuthenticated) {
    throw new Error("Unauthorized");
  }

  const filePath = path.join(process.cwd(), "src/content/threads", `${id}.mdoc`);
  try {
    await fs.unlink(filePath);
    revalidatePath("/threads");
    return true;
  } catch (error) {
    console.error("Failed to delete thread:", error);
    return false;
  }
}
