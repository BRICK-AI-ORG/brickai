"use client";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const Footer = () => {
  const { isLoggedIn } = useAuth();
  const year = new Date().getFullYear();
  return (
    <footer className="relative z-10 bg-[#171717] text-white border-t border-white/10 mt-0">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand + CTA */}
          <div>
            <Link href="/home" className="inline-flex items-center gap-3">
              <Image src="/favicon.png" alt="BrickAI logo" width={32} height={32} className="w-8 h-8" />
              <span className="text-lg font-semibold">BrickAI</span>
            </Link>
            <p className="mt-3 text-sm text-white/70 max-w-sm">
              Property analytics and workflow hub for ambitious investors.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {!isLoggedIn && (
                <Link href="/create-account" aria-label="Get Started">
                  <Button className="h-9 px-4 bg-[#aa2ee2] hover:bg-[#9322c8] transition-shadow hover:shadow-[0_8px_26px_-6px_rgba(170,46,226,0.45)]">Get Started</Button>
                </Link>
              )}
              <Link href="/pricing" aria-label="View Pricing">
                <Button variant="outline" className="h-9 px-4 transition-shadow hover:text-[#aa2ee2] hover:border-[#aa2ee2]/40 hover:shadow-[0_8px_26px_-6px_rgba(170,46,226,0.35)]">Pricing</Button>
              </Link>
            </div>
          </div>

          {/* Product */}
          <div>
            <div className="text-sm font-semibold uppercase tracking-wide text-white/80">Product</div>
            {(() => {
              const product = [
                { label: "About", href: "/about" },
                { label: "Pricing", href: "/pricing" },
                { label: "Solutions", href: "/solutions" },
              ].sort((a, b) => a.label.localeCompare(b.label));
              return (
                <ul className="mt-3 space-y-2 text-sm text-white/80">
                  {product.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} className="hover:text-white">{item.label}</Link>
                    </li>
                  ))}
                </ul>
              );
            })()}
          </div>

          {/* Resources */}
          <div>
            <div className="text-sm font-semibold uppercase tracking-wide text-white/80">Resources</div>
            {(() => {
              let resources = [
                { label: "Contact", href: "/contact" },
                { label: "Create Account", href: "/create-account" },
                { label: "FAQs", href: "/faqs" },
                { label: "Login", href: "/login" },
              ];
              if (isLoggedIn) {
                resources = resources.filter(
                  (r) => r.href !== "/login" && r.href !== "/create-account"
                );
              }
              resources = resources.sort((a, b) => a.label.localeCompare(b.label));
              return (
                <ul className="mt-3 space-y-2 text-sm text-white/80">
                  {resources.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} className="hover:text-white">{item.label}</Link>
                    </li>
                  ))}
                </ul>
              );
            })()}
          </div>

          {/* Legal */}
          <div>
            <div className="text-sm font-semibold uppercase tracking-wide text-white/80">Legal</div>
            {(() => {
              const legal = [
                { label: "Cookie Policy", href: "/cookie-policy" },
                { label: "Privacy Policy", href: "/privacy-policy" },
                { label: "Terms & Conditions", href: "/terms-and-conditions" },
              ].sort((a, b) => a.label.localeCompare(b.label));
              return (
                <ul className="mt-3 space-y-2 text-sm text-white/80">
                  {legal.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} className="hover:text-white">{item.label}</Link>
                    </li>
                  ))}
                </ul>
              );
            })()}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 text-xs text-white/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>© {year} BrickAI. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <Link href="/terms-and-conditions" className="hover:text-white">Terms</Link>
            <Link href="/privacy-policy" className="hover:text-white">Privacy</Link>
            <Link href="/cookie-policy" className="hover:text-white">Cookies</Link>
            <Link href="/faqs" className="hover:text-white">FAQs</Link>
            <Link href="/contact" className="hover:text-white">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
