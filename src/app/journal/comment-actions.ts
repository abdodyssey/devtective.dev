"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "src/data");
const VISITORS_FILE = path.join(DATA_DIR, "visitors.json");

// ── Types ──────────────────────────────────────────────────────────────────

export interface Comment {
  id: string;
  slug: string;
  name: string;
  content: string;
  createdAt: string;
  parentId?: string;
}

export interface VisitorRecord {
  name: string;
  firstSeen: string;
  lastSeen: string;
  visitCount: number;
  pages: string[];
}

// ── Helpers ─────────────────────────────────────────────────────────────────

async function ensureDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(path.join(DATA_DIR, "comments"), { recursive: true });
}

async function readComments(slug: string): Promise<Comment[]> {
  await ensureDir();
  const file = path.join(DATA_DIR, "comments", `${slug}.json`);
  try {
    return JSON.parse(await fs.readFile(file, "utf-8"));
  } catch {
    return [];
  }
}

async function writeComments(slug: string, comments: Comment[]) {
  await ensureDir();
  const file = path.join(DATA_DIR, "comments", `${slug}.json`);
  await fs.writeFile(file, JSON.stringify(comments, null, 2), "utf-8");
}

async function readVisitors(): Promise<Record<string, VisitorRecord>> {
  await ensureDir();
  try {
    return JSON.parse(await fs.readFile(VISITORS_FILE, "utf-8"));
  } catch {
    return {};
  }
}

// ── Public Actions ───────────────────────────────────────────────────────────

export async function getComments(slug: string): Promise<Comment[]> {
  return readComments(slug);
}

export async function addComment(
  slug: string,
  name: string,
  content: string,
  parentId?: string
): Promise<{ success: boolean; comment?: Comment; error?: string }> {
  const trimName = name.trim();
  const trimContent = content.trim();
  if (!trimName || trimName.length < 2) return { success: false, error: "Nama terlalu pendek." };
  if (!trimContent || trimContent.length < 1) return { success: false, error: "Komentar kosong." };
  if (trimContent.length > 1000) return { success: false, error: "Komentar terlalu panjang (max 1000 karakter)." };

  const comment: Comment = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    slug,
    name: trimName,
    content: trimContent,
    createdAt: new Date().toISOString(),
    parentId,
  };

  const comments = await readComments(slug);
  comments.push(comment);
  await writeComments(slug, comments);
  revalidatePath(`/journal/${slug}`);
  return { success: true, comment };
}

export async function deleteComment(slug: string, commentId: string): Promise<boolean> {
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.get("journal_session")?.value === "authenticated";
  if (!isAuthenticated) return false;

  const comments = await readComments(slug);
  // Delete comment and all its children
  const idsToDelete = new Set<string>();
  const findChildren = (id: string) => {
    idsToDelete.add(id);
    comments.filter(c => c.parentId === id).forEach(c => findChildren(c.id));
  };
  findChildren(commentId);

  const filtered = comments.filter(c => !idsToDelete.has(c.id));
  await writeComments(slug, filtered);
  revalidatePath(`/journal/${slug}`);
  return true;
}

// ── Visitor Tracking ──────────────────────────────────────────────────────────

export async function recordVisit(name: string, page: string): Promise<void> {
  const visitors = await readVisitors();
  const key = name.toLowerCase().trim();
  if (!key || key.length < 2) return;

  const now = new Date().toISOString();
  if (visitors[key]) {
    visitors[key].lastSeen = now;
    visitors[key].visitCount += 1;
    if (!visitors[key].pages.includes(page)) visitors[key].pages.push(page);
  } else {
    visitors[key] = { name: name.trim(), firstSeen: now, lastSeen: now, visitCount: 1, pages: [page] };
  }

  await fs.writeFile(VISITORS_FILE, JSON.stringify(visitors, null, 2), "utf-8");
}

export async function getVisitorStats(): Promise<{
  totalUnique: number;
  totalVisits: number;
  visitors: VisitorRecord[];
}> {
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.get("journal_session")?.value === "authenticated";
  if (!isAuthenticated) return { totalUnique: 0, totalVisits: 0, visitors: [] };

  const visitors = await readVisitors();
  const list = Object.values(visitors).sort(
    (a, b) => new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime()
  );
  return {
    totalUnique: list.length,
    totalVisits: list.reduce((s, v) => s + v.visitCount, 0),
    visitors: list,
  };
}
