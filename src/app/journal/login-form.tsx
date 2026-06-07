"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { verifyAndUnlockJournal } from "./actions";
import { Lock, X } from "lucide-react";

interface LoginFormProps {
  isModal?: boolean;
  onClose?: () => void;
}

export function LoginForm({ isModal = false, onClose }: LoginFormProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    setError(false);

    try {
      const success = await verifyAndUnlockJournal(password);
      if (success) {
        if (onClose) onClose();
        router.refresh();
      } else {
        setError(true);
        setPassword("");
      }
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  // Close on Escape key
  useEffect(() => {
    if (!isModal || !onClose) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModal, onClose]);

  return (
    <div 
      className={isModal ? "" : "min-h-[70vh] flex items-center justify-center px-6"}
      role={isModal ? "dialog" : "region"}
      aria-modal={isModal ? "true" : "false"}
      aria-labelledby="login-heading"
    >
      <div className="w-full max-w-sm border border-border-default bg-bg-surface p-6 rounded-lg shadow-sm relative">
        {isModal && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-text-muted hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 rounded-sm transition-colors cursor-pointer"
            aria-label="Tutup form login"
            title="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-10 h-10 rounded-full bg-accent-tint/10 flex items-center justify-center mb-3">
            <Lock className="w-5 h-5 text-accent" />
          </div>
          <h1 id="login-heading" className="font-mono text-xs uppercase tracking-[0.2em] text-text-primary">
            Private Journal
          </h1>
          <p className="font-sans text-[11px] text-text-muted mt-1">
            Masukkan password untuk membuka catatan rahasia.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password-input" className="sr-only">Password</label>
            <input
              id="password-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full font-mono text-center text-xs tracking-widest bg-bg-primary border border-border-default rounded px-3 py-2.5 text-text-primary placeholder:text-text-placeholder focus:outline-none focus:border-accent focus-visible:ring-2 focus-visible:ring-accent/50 transition-colors"
              disabled={loading}
              autoFocus
            />
          </div>

          {error && (
            <p className="text-center font-mono text-[10px] text-red-500 uppercase tracking-wider" role="alert">
              Password salah
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-text-primary text-bg-primary hover:bg-text-secondary active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 transition-all font-mono text-[10px] uppercase tracking-wider rounded font-bold cursor-pointer disabled:opacity-50"
          >
            {loading ? "Membuka..." : "Unlock"}
          </button>
        </form>
      </div>
    </div>
  );
}
