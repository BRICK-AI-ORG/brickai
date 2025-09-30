"use client";

import Link from "next/link";
import { Menu, X, UserCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import React from "react";

type AuthAction = "login" | "signup";
const authenticationButtons: Record<string, AuthAction[]> = {
  "/home": ["login", "signup"],
  "/login": ["signup"],
  "/create-account": ["login"],
};

const Header = () => {
  const { isLoggedIn } = useAuth();
  const pathname = usePathname();
  const logoSize = 72;
  const actions = authenticationButtons[pathname] ?? ["login", "signup"];
  const showSignup = actions.includes("signup");
  const showLogin = actions.includes("login");
  const bothAuthActions = showSignup && showLogin;
  const baseNavItems = [
    { label: "Solutions", href: "/solutions" },
    { label: "About", href: "/about" },
    { label: "Pricing", href: "/pricing" },
  ];
  const navItems = [...baseNavItems].sort((a, b) => a.label.localeCompare(b.label));
  const isActive = (href: string) => pathname === href;
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const closeMobile = () => setMobileOpen(false);
  return (
    <header className="relative z-10 bg-[#171717] text-white">
      <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <Link href={"/home"} className="flex items-center gap-3 text-xl font-bold min-w-0">
            <img
              src="/favicon.png"
              alt="BrickAI logo"
              width={logoSize}
              height={logoSize}
              className="w-10 h-10 sm:w-12 sm:h-12 md:w-[72px] md:h-[72px]"
            />
            <span className="hidden sm:inline">BrickAI</span>
          </Link>

          <nav className="hidden md:flex ml-6 sm:ml-8 md:ml-12 lg:ml-16 items-center gap-1 sm:gap-2">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} aria-label={item.label}>
                <Button
                  variant="ghost"
                  className={`h-8 px-2 sm:h-9 sm:px-3 text-white hover:text-white hover:bg-white/10 focus-visible:ring-white/30 ${
                    isActive(item.href) ? "bg-white/10" : ""
                  }`}
                >
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>
        </div>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-2 sm:gap-3">
          {isLoggedIn ? (
            <Link href="/profile" aria-label="Profile" className="flex-shrink-0">
              <UserCircle className="w-6 h-6" />
            </Link>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              {showSignup && (
                <Link
                  href="/create-account"
                  aria-label="Sign Up"
                  className="inline-block"
                >
                  <Button variant="outline" className="h-8 px-3 text-sm sm:h-9 sm:px-4">
                    Sign Up
                  </Button>
                </Link>
              )}
              {showLogin && (
                <Link href="/login" aria-label="Login">
                  <Button className="h-8 px-3 text-sm sm:h-9 sm:px-4 bg-[#aa2ee2] hover:bg-[#9322c8]">
                    Login
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            onClick={() => setMobileOpen((v) => !v)}
            className="text-white hover:text-white hover:bg-white/10"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile dropdown panel */}
      {mobileOpen && (
        <div id="mobile-nav" className="md:hidden border-t border-white/10">
          <div className="container mx-auto px-4 py-3 space-y-3">
            {isLoggedIn ? (
              <Link href="/profile" aria-label="Profile" onClick={closeMobile}>
                <div className="flex items-center gap-2 py-2 text-white/90 hover:text-white">
                  <UserCircle className="w-5 h-5" />
                  <span>Profile</span>
                </div>
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                {showSignup && (
                  <Link href="/create-account" aria-label="Sign Up" onClick={closeMobile}>
                    <Button variant="outline" className="h-9 px-4">Sign Up</Button>
                  </Link>
                )}
                {showLogin && (
                  <Link href="/login" aria-label="Login" onClick={closeMobile}>
                    <Button className="h-9 px-4 bg-[#aa2ee2] hover:bg-[#9322c8]">Login</Button>
                  </Link>
                )}
              </div>
            )}

            <nav className="pt-2 border-t border-white/10">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} aria-label={item.label} onClick={closeMobile}>
                  <div className={`py-2 text-white/90 hover:text-white ${isActive(item.href) ? "text-white" : ""}`}>
                    {item.label}
                  </div>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
