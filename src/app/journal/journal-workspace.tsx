"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar, Plus, Edit3, Trash2, Save, BookOpen, ArrowLeft,
  Flame, Trophy, CheckCircle2, AlertCircle, Loader2, Lock, Target, Star, ImageIcon,
  Eye, EyeOff, Bold, Italic, Code, Link2, Quote, Heading2, Users, Search, Columns,
} from "lucide-react";
import { createOrUpdateJournalEntry, deleteJournalEntry, getRawJournalContent, uploadJournalImage } from "./actions";
import { LockButton } from "./lock-button";
import { LoginForm } from "./login-form";
import type { Achievement } from "@/lib/journal-utils";

interface Post {
  slug: string;
  entry: { title: string; date: string | null; isPrivate: boolean };
}

interface JournalWorkspaceProps {
  posts: Post[];
  streakInfo: { currentStreak: number; longestStreak: number; todayCompleted: boolean };
  achievements: Achievement[];
  visitorStats: { totalUnique: number; totalVisits: number; visitors: { name: string; visitCount: number; lastSeen: string }[] } | null;
  isAuthenticated: boolean;
}

type ViewMode = "list" | "write";

const DAILY_WORD_GOAL = 200;

const COMBO_LEVELS = [
  { min: 100, label: "LV.5 UNSTOPPABLE", status: "UNSTOPPABLE! 👑", bg: "from-cyan-500/15", border: "border-cyan-500", text: "text-cyan-500" },
  { min: 50,  label: "LV.4 GODLIKE",     status: "GODLIKE! 🚀",     bg: "from-purple-500/15", border: "border-purple-500", text: "text-purple-500" },
  { min: 25,  label: "LV.3 ON FIRE",     status: "ON FIRE! 🔥",     bg: "from-red-500/15", border: "border-red-500", text: "text-red-500" },
  { min: 10,  label: "LV.2 HYPER",       status: "HYPER ACTIVE ⚡", bg: "from-orange-500/15", border: "border-orange-500", text: "text-orange-500" },
  { min: 3,   label: "LV.1 WARM UP",     status: "WARM UP ✨",      bg: "from-amber-500/15", border: "border-amber-500", text: "text-amber-500" },
];

const RARITY_STYLES: Record<string, string> = {
  common: "border-border-default text-text-muted bg-bg-surface",
  rare: "border-blue-500/40 text-blue-400 bg-blue-500/5",
  epic: "border-purple-500/40 text-purple-400 bg-purple-500/5",
  legendary: "border-amber-500/40 text-amber-400 bg-amber-500/5",
};

export function JournalWorkspace({ posts, streakInfo, achievements, visitorStats, isAuthenticated }: JournalWorkspaceProps) {
  const router = useRouter();
  const [view, setView] = useState<ViewMode>("list");
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [fetchingContent, setFetchingContent] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);

  // Form state
  const [editSlug, setEditSlug] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [isPrivate, setIsPrivate] = useState(true);
  const [content, setContent] = useState("");

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");

  // Combo state
  const [comboCount, setComboCount] = useState(0);
  const [lastTypedTime, setLastTypedTime] = useState<number>(0);
  const [lastWordCount, setLastWordCount] = useState(0);
  const [sessionWords, setSessionWords] = useState(0);
  const [baselineWords, setBaselineWords] = useState(0);
  const [levelUpFlash, setLevelUpFlash] = useState(false);
  const [prevComboLevel, setPrevComboLevel] = useState(5);
  const [splash, setSplash] = useState<{level: any, text: string, index: number} | null>(null);

  // UX improvements
  const [showPreview, setShowPreview] = useState(false);
  const [splitScreen, setSplitScreen] = useState(false);
  const [goalCelebrated, setGoalCelebrated] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const autosaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Modals
  const [alertDialog, setAlertDialog] = useState<{ isOpen: boolean; title: string; message: string }>({ isOpen: false, title: "", message: "" });
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void; actionLabel: string; isDanger: boolean }>({ isOpen: false, title: "", message: "", onConfirm: () => {}, actionLabel: "OK", isDanger: false });

  const showAlert = (title: string, message: string) => setAlertDialog({ isOpen: true, title, message });
  const showConfirm = (title: string, message: string, onConfirm: () => void, actionLabel = "OK", isDanger = false) => {
    setConfirmDialog({ isOpen: true, title, message, onConfirm: () => { onConfirm(); setConfirmDialog(p => ({ ...p, isOpen: false })); }, actionLabel, isDanger });
  };

  const getComboLevel = (count: number) => COMBO_LEVELS.find(l => count >= l.min) ?? null;
  const currentLevel = getComboLevel(comboCount);
  const currentLevelIndex = currentLevel ? COMBO_LEVELS.indexOf(currentLevel) : -1;

  const playLevelUpSound = (levelIndex: number) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const freqs = [
        [523.25, 659.25, 783.99, 1046.50, 1318.51], // UNSTOPPABLE (C major fast arpeggio)
        [440, 554.37, 659.25, 880],                 // GODLIKE (A major)
        [392, 493.88, 587.33, 783.99],              // ON FIRE (G major)
        [329.63, 415.30, 493.88],                   // HYPER (E major)
        [261.63, 329.63],                           // WARM UP (C major short)
      ];
      
      const sequence = freqs[levelIndex] || freqs[4];
      
      sequence.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = levelIndex < 2 ? 'square' : 'sine';
        osc.frequency.value = freq;
        
        const startTime = ctx.currentTime + i * 0.12;
        const duration = 0.2;
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.1, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        
        osc.start(startTime);
        osc.stop(startTime + duration);
      });
    } catch (e) {
      console.error("Audio playback failed", e);
    }
  };

  // Flash on level-up
  useEffect(() => {
    const validCurrentLevel = currentLevelIndex === -1 ? 5 : currentLevelIndex;
    if (validCurrentLevel < prevComboLevel) {
      setLevelUpFlash(true);
      if (currentLevel) {
        setSplash({ level: currentLevel, text: currentLevel.status, index: currentLevelIndex });
        playLevelUpSound(currentLevelIndex);
      }
      setTimeout(() => setLevelUpFlash(false), 600);
      setTimeout(() => setSplash(null), 2500);
    }
    setPrevComboLevel(validCurrentLevel);
  }, [currentLevelIndex, prevComboLevel, currentLevel]);

  // Auto-reset combo on pause
  useEffect(() => {
    if (comboCount === 0) return;
    const id = setInterval(() => {
      if (Date.now() - lastTypedTime > 3000) setComboCount(0);
    }, 500);
    return () => clearInterval(id);
  }, [comboCount, lastTypedTime]);

  // Debounced Autosave to localStorage
  useEffect(() => {
    if (view !== "write") return;
    if (autosaveTimeoutRef.current) clearTimeout(autosaveTimeoutRef.current);
    
    setIsSavingDraft(true);
    autosaveTimeoutRef.current = setTimeout(() => {
      const draftKey = `journal_draft_${editSlug || "new"}`;
      if (title || content) {
        localStorage.setItem(draftKey, JSON.stringify({ title, date, isPrivate, content, savedAt: Date.now() }));
      }
      setIsSavingDraft(false);
    }, 2000);

    return () => { if (autosaveTimeoutRef.current) clearTimeout(autosaveTimeoutRef.current); };
  }, [view, editSlug, title, date, isPrivate, content]);

  // Confetti on goal reached
  useEffect(() => {
    if (sessionWords >= DAILY_WORD_GOAL && !goalCelebrated) {
      setGoalCelebrated(true);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [sessionWords, goalCelebrated]);

  // Markdown toolbar helper — wraps selection or inserts with placeholder
  const insertMarkdown = (prefix: string, suffix = "", placeholder = "text") => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = content.slice(start, end) || placeholder;
    const newContent = content.slice(0, start) + prefix + selected + suffix + content.slice(end);
    handleContentChange(newContent);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 10);
  };

  // Simple markdown-to-HTML renderer for preview
  const renderMarkdown = (text: string): string => {
    const lines = text.split("\n");
    return lines.map(line => {
      if (line.startsWith("# ")) return `<h1 class="text-2xl font-bold mb-2 mt-4">${line.slice(2)}</h1>`;
      if (line.startsWith("## ")) return `<h2 class="text-xl font-bold mb-2 mt-3">${line.slice(3)}</h2>`;
      if (line.startsWith("### ")) return `<h3 class="text-lg font-bold mb-1 mt-3">${line.slice(4)}</h3>`;
      if (line.startsWith("> ")) return `<blockquote class="border-l-2 border-border-default pl-3 text-text-muted italic my-2">${line.slice(2)}</blockquote>`;
      if (line.startsWith("- ")) return `<li class="ml-4 list-disc">${line.slice(2)}</li>`;
      if (line === "") return `<div class="h-3"></div>`;
      let l = line
        .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full rounded my-2" />')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-accent underline" target="_blank">$1</a>')
        .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
        .replace(/\*([^*]+)\*/g, "<em>$1</em>")
        .replace(/`([^`]+)`/g, '<code class="bg-bg-surface px-1 rounded font-mono text-xs">$1</code>');
      return `<p class="mb-1 leading-relaxed">${l}</p>`;
    }).join("\n");
  };

  const handleContentChange = (val: string) => {
    setContent(val);
    const newWC = val.trim() ? val.trim().split(/\s+/).length : 0;
    setSessionWords(Math.max(0, newWC - baselineWords));
    if (newWC > lastWordCount) {
      const now = Date.now();
      setComboCount(prev => lastTypedTime && now - lastTypedTime < 3000 ? prev + (newWC - lastWordCount) : newWC - lastWordCount);
      setLastTypedTime(now);
    }
    setLastWordCount(newWC);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const result = await uploadJournalImage(fd);
      if (result.success) {
        // Insert markdown at cursor position
        const ta = textareaRef.current;
        const altText = file.name.replace(/\.[^.]+$/, "");
        const mdSnippet = `![${altText}](${result.url})`;
        if (ta) {
          const start = ta.selectionStart ?? content.length;
          const end = ta.selectionEnd ?? content.length;
          const newContent = content.slice(0, start) + "\n" + mdSnippet + "\n" + content.slice(end);
          handleContentChange(newContent);
          // Restore focus and move cursor after the inserted snippet
          setTimeout(() => { ta.focus(); ta.setSelectionRange(start + mdSnippet.length + 2, start + mdSnippet.length + 2); }, 50);
        } else {
          handleContentChange(content + "\n" + mdSnippet + "\n");
        }
      } else {
        showAlert("Upload Gagal", result.error ?? "Terjadi kesalahan saat mengupload gambar.");
      }
    } catch { showAlert("Upload Gagal", "Tidak dapat menghubungi server."); }
    finally {
      setImageUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const openWrite = (slug: string | null = null, t = "", d = "", priv = true, body = "") => {
    setEditSlug(slug);
    setTitle(t);
    setDate(d || (() => { const n = new Date(); return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}-${String(n.getDate()).padStart(2,"0")}`; })());
    setIsPrivate(priv);
    setContent(body);
    const wc = body.trim() ? body.trim().split(/\s+/).length : 0;
    setLastWordCount(wc);
    setBaselineWords(wc);
    setSessionWords(0);
    setComboCount(0);
    setGoalCelebrated(false);
    setShowPreview(false);
    // Check for existing draft
    const draftKey = `journal_draft_${slug || "new"}`;
    const saved = localStorage.getItem(draftKey);
    if (saved) {
      try { const d2 = JSON.parse(saved); if (d2.content && d2.content !== body) setHasDraft(true); } catch {}
    } else { setHasDraft(false); }
    setView("write");
  };

  const handleNewEntry = () => { if (!isAuthenticated) return; openWrite(); };

  const handleEditEntry = async (post: Post) => {
    if (!isAuthenticated) return;
    setFetchingContent(true);
    try {
      const raw = await getRawJournalContent(post.slug);
      openWrite(post.slug, post.entry.title, post.entry.date || "", post.entry.isPrivate, raw);
    } catch { showAlert("Gagal Memuat", "Tidak dapat mengambil isi tulisan."); }
    finally { setFetchingContent(false); }
  };

  const handleDeleteEntry = (slug: string, t: string) => {
    if (!isAuthenticated) return;
    showConfirm("Hapus Catatan", `Hapus jurnal "${t}"? Ini permanen.`, async () => {
      setLoading(true);
      try { if (await deleteJournalEntry(slug)) router.refresh(); else showAlert("Gagal Menghapus", "Terjadi kesalahan."); }
      catch { showAlert("Eror", "Gagal menghubungi server."); }
      finally { setLoading(false); }
    }, "HAPUS", true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return;
    if (!title.trim() || !content.trim() || !date) { showAlert("Input Tidak Lengkap", "Judul, tanggal, dan isi tidak boleh kosong."); return; }
    setLoading(true);
    try {
      const r = await createOrUpdateJournalEntry(editSlug, title, date, isPrivate, content);
      if (r.success) { setView("list"); router.refresh(); }
    } catch { showAlert("Gagal Menyimpan", "Terjadi kesalahan saat menyimpan."); }
    finally { setLoading(false); }
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;
  const goalPercent = Math.min(100, Math.round((sessionWords / DAILY_WORD_GOAL) * 100));
  const goalReached = sessionWords >= DAILY_WORD_GOAL;
  const unlockedCount = achievements.filter(a => a.unlocked).length;

  const Modals = () => (
    <>
      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <LoginForm isModal onClose={() => setShowLoginModal(false)} />
        </div>
      )}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-bg-surface border border-border-default rounded-lg max-w-sm w-full mx-6 p-6 shadow-2xl space-y-4">
            <h3 className="font-sans text-sm font-bold text-text-primary">{confirmDialog.title}</h3>
            <p className="font-sans text-[11px] text-text-muted leading-relaxed">{confirmDialog.message}</p>
            <div className="flex justify-end gap-2 pt-3 border-t border-border-default">
              <button type="button" onClick={() => setConfirmDialog(p => ({ ...p, isOpen: false }))} className="px-3.5 py-1.5 border border-border-default text-text-muted hover:text-text-primary rounded font-mono text-[9px] font-bold cursor-pointer">BATAL</button>
              <button type="button" onClick={confirmDialog.onConfirm} className={`px-3.5 py-1.5 rounded font-mono text-[9px] font-bold cursor-pointer text-white ${confirmDialog.isDanger ? "bg-red-500 hover:bg-red-600" : "bg-text-primary text-bg-primary"}`}>{confirmDialog.actionLabel}</button>
            </div>
          </div>
        </div>
      )}
      {alertDialog.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-bg-surface border border-border-default rounded-lg max-w-sm w-full mx-6 p-6 shadow-2xl space-y-4">
            <h3 className="font-sans text-sm font-bold text-text-primary">{alertDialog.title}</h3>
            <p className="font-sans text-[11px] text-text-muted leading-relaxed">{alertDialog.message}</p>
            <div className="flex justify-end pt-3 border-t border-border-default">
              <button type="button" onClick={() => setAlertDialog(p => ({ ...p, isOpen: false }))} className="px-3.5 py-1.5 bg-text-primary text-bg-primary hover:bg-text-secondary rounded font-mono text-[9px] font-bold cursor-pointer">OKE</button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  // ─── WRITE VIEW ──────────────────────────────────────────────────────────────
  if (view === "write") {
    return (
      <>
        <div className={`mx-auto px-6 md:px-8 pt-28 pb-16 space-y-6 transition-all duration-300 ${splitScreen ? "max-w-[1400px]" : "max-w-3xl"}`}>
          {/* Toolbar */}
          <div className="flex items-center justify-between border-b border-border-default pb-4">
            <button type="button" onClick={() => setView("list")} disabled={loading} className="flex items-center gap-1.5 font-mono text-[10px] text-text-muted hover:text-accent transition-all cursor-pointer">
              <ArrowLeft className="w-3.5 h-3.5" /> BATAL
            </button>
            <div className="flex items-center gap-2">
              {/* Preview & Split toggle */}
              <button type="button" onClick={() => { setShowPreview(p => !p); setSplitScreen(false); }}
                className={`flex items-center gap-1.5 border font-mono text-[10px] px-3 py-1.5 rounded font-bold cursor-pointer transition-all ${
                  showPreview && !splitScreen ? "border-accent text-accent" : "border-border-default text-text-muted hover:border-accent hover:text-accent"
                }`}>
                {showPreview && !splitScreen ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {showPreview && !splitScreen ? "EDIT" : "PREVIEW"}
              </button>
              <button type="button" onClick={() => { setSplitScreen(p => !p); setShowPreview(false); }}
                className={`hidden md:flex items-center gap-1.5 border font-mono text-[10px] px-3 py-1.5 rounded font-bold cursor-pointer transition-all ${
                  splitScreen ? "border-accent text-accent" : "border-border-default text-text-muted hover:border-accent hover:text-accent"
                }`}>
                <Columns className="w-3.5 h-3.5" />
                SPLIT
              </button>
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={loading || imageUploading}
                className="flex items-center gap-1.5 border border-border-default hover:border-accent text-text-muted hover:text-accent font-mono text-[10px] px-3 py-1.5 rounded font-bold cursor-pointer transition-all disabled:opacity-50">
                {imageUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImageIcon className="w-3.5 h-3.5" />}
                {imageUploading ? "..." : "IMG"}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              <button type="button" onClick={handleSave} disabled={loading || imageUploading} className="flex items-center gap-1.5 bg-text-primary text-bg-primary hover:bg-text-secondary active:scale-[0.98] font-mono text-[10px] px-3.5 py-1.5 rounded font-bold cursor-pointer disabled:opacity-50">
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                {editSlug ? "PERBARUI" : "SIMPAN"}
              </button>
            </div>
          </div>

          {/* Daily Word Goal Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between font-mono text-[9px]">
              <div className="flex items-center gap-1.5 text-text-muted">
                <Target className="w-3 h-3" />
                <span>DAILY GOAL — {sessionWords} / {DAILY_WORD_GOAL} KATA SESI INI</span>
              </div>
              <div className="flex items-center gap-4">
                <span className={isSavingDraft ? "text-text-placeholder animate-pulse" : "text-green-500/70"}>
                  {isSavingDraft ? "Menyimpan draft..." : "Draft tersimpan"}
                </span>
                <span className={goalReached ? "text-green-500 font-bold animate-pulse" : "text-text-placeholder"}>
                  {goalReached ? "GOAL REACHED! 🎯" : `${goalPercent}%`}
                </span>
              </div>
            </div>
            <div className="h-1.5 w-full bg-bg-surface border border-border-default rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  goalReached ? "bg-green-500" : goalPercent >= 75 ? "bg-amber-500" : goalPercent >= 40 ? "bg-orange-500" : "bg-text-placeholder"
                }`}
                style={{ width: `${goalPercent}%` }}
              />
            </div>
          </div>

          {/* Draft restore banner */}
          {hasDraft && (
            <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/30 rounded px-3 py-2">
              <span className="font-mono text-[9px] text-amber-500">📋 Draft tersimpan ditemukan.</span>
              <div className="flex gap-2">
                <button type="button" onClick={() => {
                  const key = `journal_draft_${editSlug || "new"}`;
                  const saved = localStorage.getItem(key);
                  if (saved) { const d = JSON.parse(saved); setTitle(d.title); setDate(d.date); setIsPrivate(d.isPrivate); handleContentChange(d.content); }
                  setHasDraft(false);
                }} className="font-mono text-[9px] text-amber-500 underline cursor-pointer">PULIHKAN</button>
                <button type="button" onClick={() => { localStorage.removeItem(`journal_draft_${editSlug || "new"}`); setHasDraft(false); }} className="font-mono text-[9px] text-text-muted underline cursor-pointer">ABAIKAN</button>
              </div>
            </div>
          )}

          {/* Markdown toolbar */}
          {!showPreview && (
            <div className="flex items-center gap-1 border border-border-default bg-bg-surface rounded px-2 py-1.5">
              {([
                { icon: <Bold className="w-3.5 h-3.5" />, title: "Bold", action: () => insertMarkdown("**", "**", "bold text") },
                { icon: <Italic className="w-3.5 h-3.5" />, title: "Italic", action: () => insertMarkdown("*", "*", "italic text") },
                { icon: <Heading2 className="w-3.5 h-3.5" />, title: "Heading", action: () => insertMarkdown("\n## ", "", "Heading") },
                { icon: <Quote className="w-3.5 h-3.5" />, title: "Quote", action: () => insertMarkdown("\n> ", "", "quote") },
                { icon: <Code className="w-3.5 h-3.5" />, title: "Code", action: () => insertMarkdown("`", "`", "code") },
                { icon: <Link2 className="w-3.5 h-3.5" />, title: "Link", action: () => insertMarkdown("[", "](url)", "link text") },
              ] as const).map((btn, i) => (
                <button key={i} type="button" onClick={btn.action} title={btn.title}
                  className="p-1.5 text-text-muted hover:text-text-primary hover:bg-bg-primary rounded transition-colors cursor-pointer">
                  {btn.icon}
                </button>
              ))}
              <div className="w-px h-4 bg-border-default mx-1" />
              <span className="font-mono text-[9px] text-text-placeholder ml-auto">Markdown supported</span>
            </div>
          )}

          {/* Editor */}
          <form onSubmit={handleSave} className="space-y-4">
            <input type="text" placeholder="Judul Jurnal..." value={title} onChange={e => setTitle(e.target.value)}
              className="w-full bg-transparent text-text-primary font-sans text-3xl font-bold placeholder:text-text-placeholder focus:outline-none" disabled={loading} required />

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-text-muted" />
                <input type="date" value={date} onChange={e => setDate(e.target.value)}
                  className="bg-bg-surface border border-border-default text-text-secondary rounded px-2.5 py-1 font-mono text-xs focus:outline-none focus:border-accent" disabled={loading} required />
              </div>
              <label className="flex items-center gap-2 font-sans text-xs text-text-secondary cursor-pointer select-none">
                <input type="checkbox" checked={isPrivate} onChange={e => setIsPrivate(e.target.checked)}
                  className="rounded border-border-default w-3.5 h-3.5 cursor-pointer" disabled={loading} />
                <span>Private Entry</span>
              </label>
            </div>

            {/* Combo HUD */}
            <div className="border-t border-border-default pt-4 space-y-3">
              <div className={`h-9 flex items-center justify-between rounded-r transition-all duration-300 ${levelUpFlash ? "scale-[1.01]" : ""}`}>
                {currentLevel ? (
                  <div className={`w-full bg-gradient-to-r ${currentLevel.bg} via-transparent to-transparent border-l-2 ${currentLevel.border} px-4 py-2 font-mono text-[10px] font-bold ${currentLevel.text} flex items-center justify-between animate-in slide-in-from-left duration-200`}>
                    <div className="flex items-center gap-2">
                      <Flame className={`w-4 h-4 fill-current ${comboCount >= 25 ? "animate-bounce" : "animate-pulse"}`} />
                      <span>{currentLevel.label}: {comboCount} KATA</span>
                    </div>
                    <span className="text-[9px] tracking-wider animate-pulse">{currentLevel.status}</span>
                  </div>
                ) : (
                  <span className="font-mono text-[9px] text-text-placeholder">{wordCount} Kata · {charCount} Karakter · Mendukung Markdown</span>
                )}
              </div>

              <div className={`grid gap-6 ${splitScreen ? "md:grid-cols-2" : "grid-cols-1"}`}>
                <div className={`${showPreview && !splitScreen ? "hidden" : "block"}`}>
                  <textarea
                    ref={textareaRef}
                    placeholder="Tulis jurnal Anda di sini... (Mendukung Markdown)"
                    value={content} onChange={e => handleContentChange(e.target.value)}
                    className="w-full min-h-[450px] bg-transparent text-text-primary font-mono text-sm leading-relaxed placeholder:text-text-placeholder focus:outline-none resize-y border-t border-border-default pt-4"
                    disabled={loading} required
                  />
                </div>
                
                {(showPreview || splitScreen) && (
                  <div
                    className={`w-full min-h-[450px] font-sans text-sm text-text-primary leading-relaxed border-t border-border-default pt-4 ${splitScreen ? "md:border-t-0 md:border-l md:pl-6" : ""}`}
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(content) || '<p class="text-text-placeholder italic">Belum ada konten untuk dipreview...</p>' }}
                  />
                )}
              </div>
            </div>
          </form>
        </div>
        {/* 🎉 Confetti celebration when 200-word goal is reached */}
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {Array.from({ length: 24 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-sm opacity-0"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `-10px`,
                  backgroundColor: ["#f97316","#eab308","#22c55e","#3b82f6","#a855f7","#ec4899","#06b6d4"][i % 7],
                  animation: `confettiFall ${1.5 + Math.random() * 1.5}s ease-in ${Math.random() * 0.8}s forwards`,
                  transform: `rotate(${Math.random() * 360}deg)`,
                }}
              />
            ))}
            <style>{`@keyframes confettiFall { 0%{opacity:1;transform:translateY(0) rotate(0deg)} 100%{opacity:0;transform:translateY(100vh) rotate(720deg)} }`}</style>
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center animate-in zoom-in duration-300">
              <div className="bg-green-500 text-white font-mono font-black text-sm px-6 py-3 rounded-lg shadow-2xl">
                🎯 GOAL REACHED! {DAILY_WORD_GOAL} KATA!
              </div>
            </div>
          </div>
        )}
        <Modals />
        
        {/* Combo Level Up Splash Animation */}
        {splash && (
          <div className="fixed inset-0 pointer-events-none z-[200] flex items-center justify-center overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-t ${splash.level.bg} opacity-50 animate-in fade-in duration-300`} />
            <div className="relative animate-in zoom-in spin-in-[8deg] duration-500 ease-out flex flex-col items-center gap-4">
               <h1 className={`font-mono text-5xl md:text-7xl font-black italic tracking-tighter ${splash.level.text} drop-shadow-[0_0_30px_currentColor] uppercase text-center scale-110`}>
                  {splash.text}
               </h1>
               <div className="flex gap-2">
                 {Array.from({length: 5 - splash.index}).map((_, i) => (
                    <Flame key={i} className={`w-16 h-16 ${splash.level.text} fill-current animate-bounce`} style={{ animationDelay: `${i * 100}ms` }} />
                 ))}
               </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // ─── LIST VIEW ────────────────────────────────────────────────────────────────
  const filteredPosts = posts.filter(post => 
    post.entry.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="max-w-6xl mx-auto px-6 md:px-8 pt-28 pb-16">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-default pb-4 mb-8">
          <div>
            <span className="font-mono text-[10px] tracking-[0.15em] text-accent uppercase block mb-1">
              {isAuthenticated ? "Personal Diary" : "Writing"}
            </span>
            <h1 className="font-sans text-3xl font-bold text-text-primary tracking-tight">
              Journal
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                {/* Achievement trophy button */}
                <button type="button" onClick={() => setShowAchievements(p => !p)}
                  className="relative flex items-center gap-1.5 border border-border-default hover:border-amber-500/50 text-text-muted hover:text-amber-500 font-mono text-[10px] px-2.5 py-1.5 rounded cursor-pointer transition-all"
                  title="Achievements">
                  <Trophy className="w-3.5 h-3.5" />
                  <span className="font-bold">{unlockedCount}/{achievements.length}</span>
                  <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-amber-500 rounded-full text-[7px] font-black text-black flex items-center justify-center">{unlockedCount}</span>
                </button>
                <button type="button" onClick={handleNewEntry} disabled={fetchingContent || loading}
                  className="flex items-center gap-1.5 bg-text-primary text-bg-primary hover:bg-text-secondary active:scale-[0.98] font-mono text-[10px] px-3 py-1.5 rounded font-bold cursor-pointer">
                  <Plus className="w-3.5 h-3.5" /> TULIS JURNAL
                </button>
                <LockButton />
              </>
            ) : (
              <button type="button" onClick={() => setShowLoginModal(true)} className="p-2 text-text-placeholder hover:text-text-primary transition-colors cursor-pointer" title="Unlock Private Notes">
                <Lock className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Main Content Area */}
          <div className="flex-1 order-2 lg:order-1 min-w-0">
            {/* Search Bar */}
            <div className="mb-6 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-placeholder" />
              <input 
                type="text" 
                placeholder="Cari jurnal..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-bg-surface border border-border-default focus:border-accent rounded-lg pl-10 pr-4 py-2.5 font-sans text-sm text-text-primary placeholder:text-text-placeholder transition-colors outline-none"
              />
            </div>

        {/* Stats moved to sidebar */}

            {/* Posts List */}
            {fetchingContent ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-text-muted" />
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-border-default rounded-lg">
                <BookOpen className="w-8 h-8 text-text-placeholder mx-auto mb-2" />
                <p className="font-mono text-xs text-text-muted">
                  {searchTerm ? "Tidak ada jurnal yang sesuai dengan pencarian." : "Belum ada catatan jurnal."}
                </p>
                {!searchTerm && isAuthenticated && (
                  <button type="button" onClick={handleNewEntry} className="mt-4 px-4 py-2 bg-text-primary text-bg-primary rounded font-mono text-[10px] font-bold">
                    MULAI MENULIS ✍️
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPosts.map(post => {
                  const formattedDate = post.entry.date
                    ? new Date(post.entry.date).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })
                    : "Tanggal tidak diketahui";
                  return (
                    <div key={post.slug} className="p-4 border border-border-default bg-bg-surface rounded-lg flex items-start justify-between gap-4 group hover:border-accent transition-colors duration-200">
                      <Link href={`/journal/${post.slug}`} className="block flex-1 min-w-0">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="font-sans text-base font-bold text-text-primary group-hover:text-accent transition-colors truncate">{post.entry.title}</h2>
                            {isAuthenticated && post.entry.isPrivate && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-500 font-mono text-[8px] font-bold whitespace-nowrap">
                                <Lock className="w-2 h-2" /> PRIVATE
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 font-mono text-[10px] text-text-muted">
                            <Calendar className="w-3 h-3" /> {formattedDate}
                          </div>
                        </div>
                      </Link>
                      {isAuthenticated && (
                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button type="button" onClick={() => handleEditEntry(post)} className="p-1.5 hover:text-accent text-text-muted rounded hover:bg-bg-primary transition-colors cursor-pointer" title="Edit">
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button type="button" onClick={() => handleDeleteEntry(post.slug, post.entry.title)} className="p-1.5 hover:text-red-500 text-text-muted rounded hover:bg-bg-primary transition-colors cursor-pointer" title="Hapus">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar Area */}
          <div className="w-full lg:w-80 order-1 lg:order-2 space-y-6 shrink-0">
            {/* Achievement Panel */}
            {isAuthenticated && showAchievements && (
              <div className="p-4 border border-amber-500/20 bg-amber-500/5 rounded-lg space-y-3 animate-in slide-in-from-top duration-200">
                <div className="flex items-center gap-2 font-mono text-[9px] text-amber-500 uppercase tracking-wider font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-500" />
                  Achievements — {unlockedCount}/{achievements.length} Unlocked
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {achievements.map(a => (
                    <div key={a.id} className={`flex items-center gap-2 p-2 rounded border transition-all ${a.unlocked ? RARITY_STYLES[a.rarity] : "border-border-default text-text-placeholder bg-bg-surface opacity-40 grayscale"}`}>
                      <span className="text-base">{a.icon}</span>
                      <div className="min-w-0">
                        <div className="font-mono text-[9px] font-bold leading-none truncate">{a.label}</div>
                        <div className="font-sans text-[9px] text-text-muted leading-tight mt-0.5 line-clamp-2">{a.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Streak Stats */}
            {isAuthenticated && (
              <div className="flex flex-col gap-4 p-4 border border-border-default bg-bg-surface rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${streakInfo.currentStreak > 0 ? "bg-orange-500/10" : "bg-text-placeholder/10"}`}>
                    <Flame className={`w-5 h-5 ${streakInfo.currentStreak > 0 ? "text-orange-500 fill-orange-500" : "text-text-placeholder"}`} />
                  </div>
                  <div>
                    <span className="font-mono text-[9px] text-text-placeholder uppercase block">Current Streak</span>
                    <span className="font-sans text-sm font-bold text-text-primary">{streakInfo.currentStreak} Hari</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${streakInfo.longestStreak > 0 ? "bg-amber-500/10" : "bg-text-placeholder/10"}`}>
                    <Trophy className={`w-5 h-5 ${streakInfo.longestStreak > 0 ? "text-amber-500" : "text-text-placeholder"}`} />
                  </div>
                  <div>
                    <span className="font-mono text-[9px] text-text-placeholder uppercase block">Longest Streak</span>
                    <span className="font-sans text-sm font-bold text-text-primary">{streakInfo.longestStreak} Hari</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-border-default">
                  {streakInfo.todayCompleted ? (
                    <>
                      <div className="w-9 h-9 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                        <span className="font-mono text-[9px] text-green-500 uppercase block">Daily Status</span>
                        <span className="font-sans text-xs text-text-primary">Hari ini selesai! 🔥</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-9 h-9 rounded-full bg-blue-500/10 flex items-center justify-center animate-pulse shrink-0">
                        <AlertCircle className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <span className="font-mono text-[9px] text-blue-500 uppercase block">Daily Status</span>
                        <span className="font-sans text-xs text-text-primary">Belum nulis hari ini ✍️</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Visitor Analytics Panel */}
            {isAuthenticated && visitorStats && visitorStats.totalUnique > 0 && (
              <div className="p-4 border border-border-default bg-bg-surface rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-mono text-[11px] text-text-muted uppercase tracking-wider font-bold">
                    <Users className="w-4 h-4" />
                    Visitor Record
                  </div>
                </div>
                <div className="flex flex-col gap-2 font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-text-placeholder">Unique Visitors</span>
                    <span className="text-text-primary font-bold">{visitorStats.totalUnique}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-placeholder">Total Visits</span>
                    <span className="text-text-primary font-bold">{visitorStats.totalVisits}</span>
                  </div>
                </div>
                <div className="pt-3 border-t border-border-default flex flex-wrap gap-2">
                  {visitorStats.visitors.map((v, i) => (
                    <div key={i} className="flex items-center gap-1.5 bg-bg-primary border border-border-default rounded-full px-2.5 py-1">
                      <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center font-mono text-[10px] font-bold text-accent shrink-0">
                        {v.name.slice(0,1).toUpperCase()}
                      </div>
                      <span className="font-mono text-[11px] text-text-secondary font-bold truncate max-w-[80px]">{v.name}</span>
                      <span className="font-mono text-[10px] text-text-placeholder bg-bg-surface px-1.5 rounded">{v.visitCount}x</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Modals />
    </>
  );
}
