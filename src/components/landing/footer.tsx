"use client";

import Link from "next/link";
import Image from "next/image";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { useTranslation } from "@/lib/i18n/use-translation";

const socialLinks = [
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
];

export function Footer() {
  const { tr, t } = useTranslation();

  const footerLinks = {
    product: [
      { label: tr(t.landing.nav.features),    href: "/#features" },
      { label: tr(t.landing.nav.howItWorks),  href: "/#how-it-works" },
      { label: tr(t.landing.footer.pricing),  href: "/pricing" },
      { label: tr(t.landing.footer.faq),      href: "/faq" },
    ],
    company: [
      { label: tr(t.landing.footer.about),    href: "/about" },
      { label: tr(t.landing.footer.blog),     href: "/blog" },
      { label: tr(t.landing.footer.careers),  href: "/careers" },
      { label: tr(t.landing.footer.contact),  href: "/contact" },
    ],
    legal: [
      { label: tr(t.landing.footer.privacy),  href: "/privacy" },
      { label: tr(t.landing.footer.terms),    href: "/terms" },
      { label: tr(t.landing.footer.cookies),  href: "/cookie-policy" },
    ],
  };

  return (
    <footer className="border-t border-border bg-card px-6 pb-8 pt-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block">
              <Image src="/logo.png" alt="StudyFlow" width={150} height={50} className="h-16 w-auto dark:brightness-0 dark:invert" />
            </Link>
            <p className="text-muted-foreground max-w-sm mb-2">{tr(t.landing.footer.tagline)}</p>
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a key={social.label} href={social.href} className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary/10 hover:bg-primary hover:text-secondary-foreground transition-all" aria-label={social.label}>
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{tr(t.landing.footer.platform)}</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.href}><Link href={link.href} className="text-muted-foreground hover:text-primary transition-colors">{link.label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{tr(t.landing.footer.company)}</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}><Link href={link.href} className="text-muted-foreground hover:text-primary transition-colors">{link.label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{tr(t.landing.footer.legal)}</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}><Link href={link.href} className="text-muted-foreground hover:text-primary transition-colors">{link.label}</Link></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-primary/10 flex justify-center items-center">
          <p className="text-muted-foreground/60 text-sm">
            &copy; {new Date().getFullYear()} StudyFlow. {tr(t.landing.footer.rights)}
          </p>
        </div>
      </div>
    </footer>
  );
}
