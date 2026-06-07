"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Lock, MessageSquare, Send, Globe, ImageIcon, Loader2 } from "lucide-react";
import { createThread, deleteThread } from "./actions";
import { DocumentRenderer } from "@keystatic/core/renderer";
import { LoginForm } from "../journal/login-form";
import { uploadJournalImage } from "../journal/actions";

interface Thread {
  id: string;
  entry: {
    date: string | null;
    isPrivate: boolean;
    content: any; // DocumentRenderer compatible structure
  };
}

interface ThreadsWorkspaceProps {
  threads: Thread[];
  isAuthenticated: boolean;
}

// Simple time-ago formatter
function timeAgo(dateString: string | null) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " tahun lalu";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " bulan lalu";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " hari lalu";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " jam lalu";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " menit lalu";
  return Math.floor(seconds) + " detik lalu";
}

export function ThreadsWorkspace({ threads, isAuthenticated }: ThreadsWorkspaceProps) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; id: string; onConfirm: () => void }>({ isOpen: false, id: "", onConfirm: () => {} });

  const handlePost = async () => {
    if (!content.trim() || !isAuthenticated) return;
    setLoading(true);
    try {
      const res = await createThread(content, isPrivate);
      if (res.success) {
        setContent("");
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      id,
      onConfirm: async () => {
        setLoading(true);
        await deleteThread(id);
        setConfirmDialog({ isOpen: false, id: "", onConfirm: () => {} });
        setLoading(false);
        router.refresh();
      }
    });
  };

  return (
    <>
      <div className="max-w-2xl mx-auto px-4 md:px-8 pt-28 pb-16 min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-border-default">
          <div>
            <span className="font-mono text-[10px] tracking-[0.15em] text-accent uppercase block mb-1">
              Microblog
            </span>
            <h1 className="font-sans text-3xl font-bold text-text-primary tracking-tight">
              Threads
            </h1>
          </div>
          {!isAuthenticated && (
            <button type="button" onClick={() => setShowLoginModal(true)} className="p-2 text-text-placeholder hover:text-text-primary transition-colors cursor-pointer" title="Login as Owner">
              <Lock className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Composer (Owner only) */}
        {isAuthenticated && (
          <div className="mb-8 bg-bg-surface border border-border-default p-4 rounded-lg">
            <textarea
              placeholder="Apa yang sedang kamu pikirkan? (Mendukung Markdown tipis-tipis)"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={loading}
              className="w-full bg-transparent resize-none focus:outline-none min-h-[100px] text-text-primary font-sans text-base placeholder:text-text-placeholder"
            />
            <div className="flex items-center justify-between pt-3 border-t border-border-default mt-2">
              <div className="flex items-center gap-4">
                <button 
                  type="button" 
                  onClick={() => setIsPrivate(!isPrivate)}
                  className={`flex items-center gap-1.5 font-mono text-[10px] px-2.5 py-1 rounded transition-colors ${isPrivate ? "border border-border-default text-text-muted" : "border border-border-default text-text-primary"}`}
                >
                  {isPrivate ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                  {isPrivate ? "PRIVATE" : "PUBLIC"}
                </button>
              </div>
              <button 
                type="button" 
                onClick={handlePost}
                disabled={!content.trim() || loading}
                className="flex items-center gap-1.5 bg-text-primary text-bg-primary hover:bg-text-secondary disabled:opacity-50 px-4 py-1.5 rounded font-sans text-sm font-bold transition-all cursor-pointer"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Post
              </button>
            </div>
          </div>
        )}

        {/* Feed */}
        <div className="space-y-6">
          {threads.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-border-default rounded-lg">
              <MessageSquare className="w-8 h-8 text-text-placeholder mx-auto mb-2" />
              <p className="font-mono text-xs text-text-muted">Belum ada thread yang dibagikan.</p>
            </div>
          ) : (
            threads.map(thread => (
              <div key={thread.id} className="group flex gap-4 p-4 border border-border-default bg-bg-surface rounded-lg hover:border-accent transition-colors">
                {/* Avatar area */}
                <div className="w-10 h-10 rounded bg-bg-primary border border-border-default shrink-0 flex items-center justify-center font-mono font-bold text-lg text-text-primary">
                  D
                </div>
                
                {/* Content area */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-sans font-bold text-text-primary">Devtective</span>
                      <span className="font-mono text-[10px] text-text-muted">· {timeAgo(thread.entry.date)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {thread.entry.isPrivate && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-border-default text-text-muted font-mono text-[8px] font-bold">
                          <Lock className="w-2 h-2" /> PRIVATE
                        </span>
                      )}
                      {isAuthenticated && (
                        <button 
                          onClick={() => handleDelete(thread.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-text-muted hover:text-red-500 transition-all rounded hover:bg-red-500/10 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="prose prose-sm dark:prose-invert max-w-none text-text-secondary leading-relaxed space-y-2 prose-p:my-1 prose-a:text-accent">
                    <DocumentRenderer document={thread.entry.content} />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modals */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <LoginForm isModal onClose={() => setShowLoginModal(false)} />
        </div>
      )}

      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-bg-surface border border-border-default rounded-lg max-w-sm w-full mx-6 p-6 shadow-2xl space-y-4">
            <h3 className="font-sans text-sm font-bold text-text-primary">Hapus Thread?</h3>
            <p className="font-sans text-[11px] text-text-muted leading-relaxed">Tindakan ini tidak bisa dibatalkan.</p>
            <div className="flex justify-end gap-2 pt-3 border-t border-border-default">
              <button type="button" onClick={() => setConfirmDialog({ isOpen: false, id: "", onConfirm: () => {} })} className="px-3.5 py-1.5 border border-border-default text-text-muted hover:text-text-primary rounded font-mono text-[9px] font-bold cursor-pointer">BATAL</button>
              <button type="button" onClick={confirmDialog.onConfirm} className="px-3.5 py-1.5 rounded font-mono text-[9px] font-bold cursor-pointer text-white bg-red-500 hover:bg-red-600">HAPUS</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
