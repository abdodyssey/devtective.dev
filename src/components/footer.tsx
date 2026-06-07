import Link from "next/link";

interface FooterProps {
  githubUsername: string;
}

export function Footer({ githubUsername }: FooterProps) {
  const email = "abdodyssey@gmail.com";

  return (
    <footer
      id="contact"
      className="border-t border-border-default py-12 max-w-3xl mx-auto px-6 md:px-8"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
        <div>
          <span className="font-mono font-medium text-text-primary text-base">
            devtective.
          </span>
          <p className="font-sans text-sm text-text-muted mt-1">
            Terbuka untuk freelance, full-time, atau sekadar ngobrol soal tech.
          </p>
        </div>
        <div className="flex flex-col gap-1.5 font-mono text-[11px] text-text-muted">
          <a
            href={`https://github.com/${githubUsername}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-text-primary transition-colors duration-150 uppercase"
          >
            GitHub ↗
          </a>
          <a
            href={`mailto:${email}`}
            className="hover:text-text-primary transition-colors duration-150 uppercase"
          >
            Email ↗
          </a>
          <a
            href="https://linkedin.com/in/m-abdi-nugroho"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-text-primary transition-colors duration-150 uppercase"
          >
            LinkedIn ↗
          </a>
        </div>
      </div>
      <div className="border-t border-border-default mt-8 pt-6">
        <div className="flex items-center justify-center gap-1.5 font-mono text-[9px] text-text-placeholder">
          <span>© 2026 M. Abdi Nugroho · devtective.dev</span>
          <span>·</span>
          <Link
            href="/journal"
            className="hover:text-text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent/50 rounded transition-colors cursor-pointer"
            aria-label="Private Journal"
          >
            [journal]
          </Link>
          <span>·</span>
          <Link
            href="/profile"
            className="hover:text-text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent/50 rounded transition-colors cursor-pointer"
            aria-label="Edit Profile"
          >
            [edit profile]
          </Link>
        </div>
      </div>
    </footer>
  );
}
