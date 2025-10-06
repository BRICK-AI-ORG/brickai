"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import {
  Menu,
  X,
  LayoutDashboard,
  UserCircle,
  FileText,
  Shield,
  Cookie,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

function NavIcon({ active }: { active: boolean }) {
  return (
    <span
      className={`absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r ${
        active ? "bg-[#aa2ee2]" : "bg-transparent"
      }`}
    />
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  // null = follow breakpoint defaults (tablet expanded, desktop collapsed)
  const [collapsed, setCollapsed] = useState<boolean | null>(null);
  const isActive = (href: string) => pathname === href;

  const navItems = useMemo(
    () => [
      { href: "/app/hub", label: "Hub", Icon: LayoutDashboard },
      { href: "/app/terms-and-conditions", label: "Terms", Icon: FileText },
      { href: "/app/privacy-policy", label: "Privacy", Icon: Shield },
      { href: "/app/cookie-policy", label: "Cookies", Icon: Cookie },
    ],
    []
  );

  const widthClass = collapsed === null ? "md:w-56 lg:w-16" : collapsed ? "w-16" : "w-56";
  const allowHoverExpand = collapsed !== false; // expand on hover unless forced expanded

  const labelClass = (href: string) => {
    if (collapsed === false) return "inline ml-2";
    if (collapsed === true) return "hidden";
    // default: tablet shows, desktop only on hover
    return `hidden md:inline lg:hidden ${allowHoverExpand ? "group-hover:lg:inline" : ""} ml-2`;
  };

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <>
      {navItems.map(({ href, label, Icon }) => (
        <Link
          key={href}
          href={href}
          aria-label={label}
          className="relative flex items-center h-10 rounded-md hover:bg-white/10 px-2"
          onClick={onClick}
        >
          <NavIcon active={isActive(href)} />
          <Icon className={`h-5 w-5 ${isActive(href) ? "text-white" : "text-white/80"}`} />
          <span className={`text-sm text-white/90 ${labelClass(href)}`}>{label}</span>
        </Link>
      ))}
    </>
  );

  return (
    <>
      {/* Mobile top bar with hamburger */}
      <div className="md:hidden sticky top-0 z-20 -mx-2 sm:mx-0">
        <div className="flex items-center justify-between bg-[#171717] border-b border-white/10 px-3 py-2 rounded-md">
          <Link href="/app/hub" className="flex items-center gap-2" aria-label="BrickAI">
            <Image src="/favicon.png" alt="BrickAI" width={24} height={24} className="w-6 h-6" />
            <span className="text-sm font-semibold">BrickAI</span>
          </Link>
          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            className="h-9 w-9 inline-flex items-center justify-center rounded-md hover:bg-white/10"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {mobileOpen && (
          <div className="bg-[#171717] border-b border-white/10 px-3 py-2 rounded-md mt-1">
            <div className="flex items-center gap-2">
              <NavLinks onClick={() => setMobileOpen(false)} />
              <div className="ml-auto">
                <Link
                  href="/app/profile"
                  aria-label="Profile"
                  className="relative flex items-center justify-center h-10 w-10 rounded-md hover:bg-white/10"
                  onClick={() => setMobileOpen(false)}
                >
                  <UserCircle className={`h-5 w-5 ${isActive("/app/profile") ? "text-white" : "text-white/80"}`} />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tablet/Desktop pinned sidebar with hover/toggle expansion */}
      <aside
        className={`hidden md:flex group flex-col justify-between shrink-0 ${widthClass} ${
          allowHoverExpand ? "lg:hover:w-56" : ""
        } transition-all duration-200`}
      >
        <div>
          <Link
            href="/app/hub"
            className="flex items-center h-12 px-2 mb-1"
            aria-label="BrickAI"
          >
            <Image src="/favicon.png" alt="BrickAI" width={28} height={28} className="w-7 h-7" />
            <span
              className={
                collapsed === false
                  ? "inline ml-2 text-sm font-semibold"
                  : collapsed === true
                  ? "hidden"
                  : `hidden md:inline lg:hidden ${allowHoverExpand ? "group-hover:lg:inline" : ""} ml-2 text-sm font-semibold`
              }
            >
              BrickAI
            </span>
          </Link>
          <nav className="flex flex-col gap-1">
            <NavLinks />
          </nav>
        </div>
        <div className="flex items-center gap-1 px-2 pb-2">
          <button
            type="button"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={collapsed === false}
            onClick={() => setCollapsed((v) => (v === null ? false : !v))}
            className="h-9 w-9 inline-flex items-center justify-center rounded-md hover:bg-white/10"
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </button>
          <Link
            href="/app/profile"
            aria-label="Profile"
            className="relative flex items-center h-10 rounded-md hover:bg-white/10 px-2 ml-auto"
          >
            <UserCircle className={`h-5 w-5 ${isActive("/app/profile") ? "text-white" : "text-white/80"}`} />
            <span className={`text-sm text-white/90 ${labelClass("/app/profile")}`}>Profile</span>
          </Link>
        </div>
      </aside>
    </>
  );
}

export default AppSidebar;
