"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Menu, X, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { LangSwitcher } from "@/components/ui/lang-switcher";
import { useTranslation } from "@/lib/i18n/use-translation";

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const { tr, t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/",               label: tr(t.landing.nav.home) },
    { href: "/#features",      label: tr(t.landing.nav.features) },
    { href: "/#how-it-works",  label: tr(t.landing.nav.howItWorks) },
    { href: "/#testimonials",  label: tr(t.landing.nav.testimonials) },
  ];

  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="StudyFlow Logo" width={140} height={50} className="h-10 w-auto dark:brightness-0 dark:invert" />
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          <LangSwitcher />
          <Button variant="theme" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/login">{tr(t.landing.nav.login)}</Link>
          </Button>
          <Button asChild>
            <Link href="/register">{tr(t.landing.nav.signUp)}</Link>
          </Button>
        </div>

        <div className="flex md:hidden items-center gap-1">
          <LangSwitcher />
          <Button variant="theme" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <button className="p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="md:hidden bg-card border-b border-border">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="text-muted-foreground hover:text-foreground transition-colors font-medium py-2" onClick={() => setMobileMenuOpen(false)}>
                {link.label}
              </a>
            ))}
            <div className="flex flex-col gap-2 pt-4 border-t border-border">
              <Button variant="ghost" asChild className="w-full">
                <Link href="/login">{tr(t.landing.nav.login)}</Link>
              </Button>
              <Button asChild className="w-full">
                <Link href="/register">{tr(t.landing.nav.signUp)}</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
