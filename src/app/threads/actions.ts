"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";

async function commitToGitHub(filePath: string, content: string, message: string) {
  const token = process.env.GITHUB_TOKEN;
  const username = process.env.GITHUB_USERNAME || "abdodyssey";
  const repo = "devtective.dev";
  
  if (!token) throw new Error("GITHUB_TOKEN is missing.");

  const url = `https://api.github.com/repos/${username}/${repo}/contents/${filePath}`;
  
  const getRes = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github.v3+json" }
  });
  let sha = undefined;
  if (getRes.ok) {
    const data = await getRes.json();
    sha = data.sha;
  }

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

export async function createThread(
  content: string,
  isPrivate: boolean
): Promise<{ success: boolean; id?: string; error?: string }> {
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.get("journal_session")?.value === "authenticated";
  if (!isAuthenticated) {
    return { success: false, error: "Unauthorized" };
  }

  const now = new Date();
  const id = now.toISOString().replace(/[:.]/g, "-");
  const dateStr = now.toISOString().slice(0, 16);
  
  const fileContent = `---
id: ${id}
date: '${dateStr}'
isPrivate: ${isPrivate}
---
${content.trim()}
`;

  if (process.env.VERCEL) {
    await commitToGitHub(
      `src/content/threads/${id}.mdoc`,
      fileContent,
      `docs: create thread ${id}`
    );
  } else {
    const filePath = path.join(process.cwd(), "src/content/threads", `${id}.mdoc`);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, fileContent, "utf-8");
  }

  revalidatePath("/threads");
  return { success: true, id };
}

export async function deleteThread(id: string): Promise<boolean> {
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.get("journal_session")?.value === "authenticated";
  if (!isAuthenticated) {
    throw new Error("Unauthorized");
  }

  try {
    if (process.env.VERCEL) {
      await deleteFromGitHub(`src/content/threads/${id}.mdoc`, `docs: delete thread ${id}`);
    } else {
      const filePath = path.join(process.cwd(), "src/content/threads", `${id}.mdoc`);
      await fs.unlink(filePath);
    }
    revalidatePath("/threads");
    return true;
  } catch (error) {
    console.error("Failed to delete thread:", error);
    return false;
  }
}
