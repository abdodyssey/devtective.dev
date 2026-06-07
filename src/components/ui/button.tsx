import Link from "next/link";
import type React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost";
  href?: string;
}

export function Button({
  variant = "primary",
  href,
  className = "",
  children,
  ...props
}: ButtonProps) {
  const baseStyle =
    "inline-flex items-center justify-center py-2 px-4 rounded font-sans text-sm font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-accent/30 cursor-pointer";
  const styles = {
    primary: "bg-accent text-white hover:bg-accent-hover",
    outline:
      "bg-transparent border border-text-primary text-text-primary hover:bg-bg-surface",
    ghost:
      "bg-transparent border border-border-default text-text-muted hover:bg-bg-surface",
  };

  const combinedClassName = `${baseStyle} ${styles[variant]} ${className}`;

  if (href) {
    if (href.startsWith("http") || href.startsWith("mailto:")) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={combinedClassName}
        >
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={combinedClassName}>
        {children}
      </Link>
    );
  }

  return (
    <button className={combinedClassName} {...props}>
      {children}
    </button>
  );
}
