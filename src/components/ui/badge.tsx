import type React from "react";

interface StatusBadgeProps {
  status: "IN PROGRESS" | "SHIPPED" | "ARCHIVED" | "ON HOLD";
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const styles = {
    "IN PROGRESS": "bg-accent-tint text-accent border border-accent-border",
    SHIPPED: "bg-bg-muted text-text-muted border border-border-default",
    ARCHIVED:
      "bg-bg-surface text-text-placeholder border border-border-default",
    "ON HOLD": "bg-bg-surface text-text-secondary border border-border-default",
  };

  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 font-mono text-[9px] font-medium tracking-wide uppercase rounded-sm ${styles[status]}`}
    >
      {status}
    </span>
  );
}

interface TechTagProps {
  children: React.ReactNode;
}

export function TechTag({ children }: TechTagProps) {
  return (
    <span className="inline-flex items-center px-2.5 py-1 bg-bg-surface border border-border-default/50 text-text-muted font-mono text-[11px] rounded-sm transition-colors hover:border-border-default hover:text-text-primary">
      {children}
    </span>
  );
}
