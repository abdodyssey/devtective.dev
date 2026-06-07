"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, Send, Trash2, Reply, X, User } from "lucide-react";
import { addComment, deleteComment, recordVisit } from "./comment-actions";
import type { Comment } from "./comment-actions";

interface CommentSectionProps {
  slug: string;
  initialComments: Comment[];
  isAuthenticated: boolean;
}

const VISITOR_NAME_KEY = "devtective_visitor_name";

export function CommentSection({ slug, initialComments, isAuthenticated }: CommentSectionProps) {
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [visitorName, setVisitorName] = useState("");
  const [showNameModal, setShowNameModal] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(null);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load visitor name from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(VISITOR_NAME_KEY);
    if (saved) {
      setVisitorName(saved);
      // Record visit silently
      recordVisit(saved, `/journal/${slug}`).catch(() => {});
    } else {
      // Delay prompt so page loads first
      const timer = setTimeout(() => setShowNameModal(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [slug]);

  const saveName = () => {
    const trimmed = nameInput.trim();
    if (!trimmed || trimmed.length < 2) return;
    localStorage.setItem(VISITOR_NAME_KEY, trimmed);
    setVisitorName(trimmed);
    setShowNameModal(false);
    recordVisit(trimmed, `/journal/${slug}`).catch(() => {});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = isAuthenticated ? "devtective (owner)" : visitorName;
    if (!name) { setShowNameModal(true); return; }
    if (!commentText.trim()) return;
    setSubmitting(true);
    setError("");

    const result = await addComment(slug, name, commentText, replyTo?.id);
    if (result.success && result.comment) {
      setComments(prev => [...prev, result.comment!]);
      setCommentText("");
      setReplyTo(null);
      router.refresh();
    } else {
      setError(result.error ?? "Gagal mengirim komentar.");
    }
    setSubmitting(false);
  };

  const handleDelete = async (commentId: string) => {
    const ok = await deleteComment(slug, commentId);
    if (ok) {
      // Remove comment and its children from local state
      const toRemove = new Set<string>();
      const collect = (id: string) => {
        toRemove.add(id);
        comments.filter(c => c.parentId === id).forEach(c => collect(c.id));
      };
      collect(commentId);
      setComments(prev => prev.filter(c => !toRemove.has(c.id)));
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

  // Build tree
  const rootComments = comments.filter(c => !c.parentId);
  const getReplies = (id: string) => comments.filter(c => c.parentId === id);

  const CommentCard = ({ comment, depth = 0 }: { comment: Comment; depth?: number }) => {
    const replies = getReplies(comment.id);
    const isOwner = comment.name === "devtective (owner)";
    return (
      <div className={`${depth > 0 ? "ml-6 border-l border-border-default pl-4" : ""}`}>
        <div className="py-3">
          <div className="flex items-start gap-2.5">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 font-mono font-bold text-[10px] ${isOwner ? "bg-accent/10 text-accent" : "bg-bg-surface text-text-muted border border-border-default"}`}>
              {comment.name.slice(0, 1).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className={`font-mono text-[10px] font-bold ${isOwner ? "text-accent" : "text-text-primary"}`}>
                  {comment.name} {isOwner && <span className="text-[8px] bg-accent/10 text-accent px-1 rounded">OWNER</span>}
                </span>
                <span className="font-mono text-[9px] text-text-placeholder">{formatDate(comment.createdAt)}</span>
              </div>
              <p className="font-sans text-sm text-text-secondary leading-relaxed mt-0.5 break-words">{comment.content}</p>
              <div className="flex items-center gap-3 mt-1.5">
                <button type="button" onClick={() => { setReplyTo({ id: comment.id, name: comment.name }); setTimeout(() => textareaRef.current?.focus(), 50); }}
                  className="flex items-center gap-1 font-mono text-[9px] text-text-placeholder hover:text-accent cursor-pointer transition-colors">
                  <Reply className="w-3 h-3" /> Reply
                </button>
                {isAuthenticated && (
                  <button type="button" onClick={() => handleDelete(comment.id)}
                    className="flex items-center gap-1 font-mono text-[9px] text-text-placeholder hover:text-red-500 cursor-pointer transition-colors">
                    <Trash2 className="w-3 h-3" /> Hapus
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        {replies.length > 0 && replies.map(r => <CommentCard key={r.id} comment={r} depth={depth + 1} />)}
      </div>
    );
  };

  return (
    <>
      {/* Visitor Name Modal */}
      {showNameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-bg-surface border border-border-default rounded-lg w-full max-w-sm mx-6 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-accent" />
                </div>
                <h2 className="font-mono text-xs font-bold text-text-primary uppercase tracking-wider">Siapa kamu?</h2>
              </div>
              <button type="button" onClick={() => setShowNameModal(false)} className="text-text-placeholder hover:text-text-primary cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="font-sans text-[11px] text-text-muted leading-relaxed">
              Perkenalkan dirimu supaya kita bisa berinteraksi di sini. Nama kamu tidak akan disimpan di server tanpa kamu berkomentar.
            </p>
            <form onSubmit={e => { e.preventDefault(); saveName(); }} className="space-y-3">
              <input
                type="text" placeholder="Nama kamu..." value={nameInput}
                onChange={e => setNameInput(e.target.value)} maxLength={40} autoFocus
                className="w-full bg-bg-primary border border-border-default rounded px-3 py-2 font-sans text-sm text-text-primary placeholder:text-text-placeholder focus:outline-none focus:border-accent"
              />
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowNameModal(false)}
                  className="flex-1 py-2 border border-border-default text-text-muted hover:text-text-primary rounded font-mono text-[9px] font-bold cursor-pointer">
                  LEWATI
                </button>
                <button type="submit" disabled={nameInput.trim().length < 2}
                  className="flex-1 py-2 bg-text-primary text-bg-primary rounded font-mono text-[9px] font-bold cursor-pointer disabled:opacity-50">
                  MASUK
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Comment Section */}
      <div className="mt-12 border-t border-border-default pt-8 space-y-6">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-text-muted" />
          <h2 className="font-mono text-[10px] uppercase tracking-wider text-text-muted font-bold">
            {comments.length} {comments.length === 1 ? "Reply" : "Replies"}
          </h2>
          {visitorName && !isAuthenticated && (
            <span className="ml-auto font-mono text-[9px] text-text-placeholder">
              Berkomentar sebagai <span className="text-text-secondary font-bold">{visitorName}</span>
              <button type="button" onClick={() => { setShowNameModal(true); setNameInput(visitorName); }} className="ml-1.5 underline hover:text-accent cursor-pointer">ganti</button>
            </span>
          )}
        </div>

        {/* Comment form */}
        <form onSubmit={handleSubmit} className="space-y-2">
          {replyTo && (
            <div className="flex items-center gap-2 bg-accent/5 border border-accent/20 rounded px-3 py-1.5">
              <Reply className="w-3 h-3 text-accent" />
              <span className="font-mono text-[9px] text-accent">Membalas {replyTo.name}</span>
              <button type="button" onClick={() => setReplyTo(null)} className="ml-auto text-text-placeholder hover:text-text-primary cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          <div className="flex gap-2 items-start">
            <div className="w-7 h-7 rounded-full bg-bg-surface border border-border-default flex items-center justify-center flex-shrink-0 mt-0.5 font-mono font-bold text-[10px] text-text-muted">
              {(isAuthenticated ? "D" : visitorName?.slice(0,1)?.toUpperCase()) || "?"}
            </div>
            <div className="flex-1 space-y-2">
              {!visitorName && !isAuthenticated && (
                <button type="button" onClick={() => setShowNameModal(true)}
                  className="w-full text-left bg-bg-surface border border-dashed border-border-default rounded px-3 py-2 font-sans text-sm text-text-placeholder hover:border-accent hover:text-text-muted transition-colors cursor-pointer">
                  Klik untuk memperkenalkan diri sebelum berkomentar...
                </button>
              )}
              {(visitorName || isAuthenticated) && (
                <>
                  <textarea
                    ref={textareaRef}
                    value={commentText} onChange={e => setCommentText(e.target.value)}
                    placeholder={replyTo ? `Balas ${replyTo.name}...` : "Tulis komentarmu di sini..."}
                    rows={3} maxLength={1000}
                    className="w-full bg-bg-surface border border-border-default rounded px-3 py-2 font-sans text-sm text-text-primary placeholder:text-text-placeholder focus:outline-none focus:border-accent resize-none"
                  />
                  {error && <p className="font-mono text-[9px] text-red-500">{error}</p>}
                  <div className="flex justify-end">
                    <button type="submit" disabled={submitting || !commentText.trim()}
                      className="flex items-center gap-1.5 bg-text-primary text-bg-primary hover:bg-text-secondary font-mono text-[10px] font-bold px-3 py-1.5 rounded cursor-pointer disabled:opacity-50 active:scale-[0.98] transition-all">
                      {submitting ? "..." : <><Send className="w-3 h-3" /> KIRIM</>}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </form>

        {/* Comments list */}
        {comments.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-border-default rounded-lg">
            <MessageCircle className="w-6 h-6 text-text-placeholder mx-auto mb-2" />
            <p className="font-mono text-[10px] text-text-muted">Belum ada komentar. Jadilah yang pertama!</p>
          </div>
        ) : (
          <div className="divide-y divide-border-default">
            {rootComments.map(c => <CommentCard key={c.id} comment={c} />)}
          </div>
        )}
      </div>
    </>
  );
}
