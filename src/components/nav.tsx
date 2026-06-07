"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when pathname changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: "/#projects", label: "projects" },
    { href: "/journal", label: "journal" },
    { href: "/threads", label: "threads" },
    { href: "/#contact", label: "contact" },
  ];

  return (
    <div className="w-full h-14 flex-shrink-0">
      <motion.header
        initial={{ y: -14, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
          scrolled || mobileMenuOpen
            ? "border-b border-border-default bg-bg-primary/90 backdrop-blur-md" 
            : "border-b border-transparent bg-bg-primary"
        }`}
      >
        <nav className="h-14 max-w-3xl mx-auto px-6 md:px-8 flex justify-between items-center">
          <Link
            href="/"
            className="font-mono font-medium text-base text-text-primary hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 rounded-sm transition-colors duration-150 z-50 relative"
            onClick={() => setMobileMenuOpen(false)}
          >
            devtective.
          </Link>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex gap-4 items-center">
            {navLinks.map((link) => {
              const isActive = link.href.startsWith('/#') 
                ? pathname === link.href 
                : pathname?.startsWith(link.href);
                
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`font-mono text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 rounded-sm px-1 py-0.5 transition-colors duration-150 ${isActive ? 'text-text-primary' : 'text-text-muted hover:text-text-primary'}`}
                >
                  {link.label}
                </Link>
              );
            })}
            
            {/* Theme Toggle Desktop */}
            {mounted && (
              <button
                type="button"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="ml-2 p-1.5 text-text-muted hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 rounded-sm transition-colors duration-150"
                aria-label="Toggle Dark Mode"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}
          </div>

          {/* Mobile Actions */}
          <div className="flex md:hidden items-center gap-2">
            {/* Theme Toggle Mobile */}
            {mounted && (
              <button
                type="button"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 rounded-sm z-50 relative"
                aria-label="Toggle Dark Mode"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              className="p-2 -mr-2 text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 rounded-sm z-50 relative"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={mobileMenuOpen ? "Tutup menu" : "Buka menu"}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              id="mobile-menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden bg-bg-primary/95 backdrop-blur-md border-b border-border-default"
            >
              <div className="flex flex-col px-6 py-4 space-y-4">
                {navLinks.map((link) => {
                  const isActive = link.href.startsWith('/#') 
                    ? pathname === link.href 
                    : pathname?.startsWith(link.href);
                    
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`font-mono text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 rounded-sm py-2 transition-colors duration-150 ${isActive ? 'text-accent font-bold' : 'text-text-primary'}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </div>
  );
}
