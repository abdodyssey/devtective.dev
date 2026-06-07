"use client";

import { useRouter } from "next/navigation";
import { lockJournal } from "./actions";
import { LogOut } from "lucide-react";

export function LockButton() {
  const router = useRouter();
  const handleLock = async () => {
    await lockJournal();
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={handleLock}
      className="flex items-center gap-1.5 font-mono text-[10px] text-text-muted hover:text-accent border border-border-default hover:border-accent px-2.5 py-1 rounded transition-all cursor-pointer"
    >
      <LogOut className="w-3 h-3" />
      LOCK JOURNAL
    </button>
  );
}
