"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState, memo } from "react";
import {
  Menu,
  X,
  LayoutDashboard,
  UserCircle,
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

const HUBBAR_STATE_KEY = "brickai.hubbarCollapsed";

export function AppSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  // Collapsed by default across desktop breakpoints
  const [collapsed, setCollapsed] = useState<boolean>(true);
  const isActive = (href: string) => pathname === href;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(HUBBAR_STATE_KEY);
    if (stored === null) return;
    const preferredCollapsed = stored !== "false";
    setCollapsed((prev) => (prev === preferredCollapsed ? prev : preferredCollapsed));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(HUBBAR_STATE_KEY, String(collapsed));
    } catch (err) {
      console.warn("Failed to persist hubbar state", err);
    }
  }, [collapsed]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = (event: StorageEvent) => {
      if (event.key !== HUBBAR_STATE_KEY) return;
      if (event.storageArea !== window.localStorage) return;
      const nextCollapsed = event.newValue !== "false";
      setCollapsed((prev) => (prev === nextCollapsed ? prev : nextCollapsed));
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const primaryNav = useMemo(
    () => [
      { href: "/app/hub", label: "Hub", Icon: LayoutDashboard },
    ],
    []
  );

  const widthClass = collapsed ? "w-16" : "w-56";
  const allowHoverExpand = collapsed !== false; // expand on hover when collapsed

  const labelClass = (href: string) => {
    if (!collapsed) return "inline ml-2";
    // collapsed: reveal labels on hover at large screens
    return `${allowHoverExpand ? "hidden lg:group-hover:inline" : "hidden"} ml-2`;
  };

  const NavLinks = ({ items, onClick, showLabels = false }: { items: { href: string; label: string; Icon: any }[]; onClick?: () => void; showLabels?: boolean }) => (
    <>
      {items.map(({ href, label, Icon }) => (
        <Link
          key={href}
          href={href}
          aria-label={label}
          className="relative flex items-center h-10 w-full rounded-md hover:bg-white/10 px-2 touch-manipulation"
          onClick={onClick}
        >
          <NavIcon active={isActive(href)} />
          <Icon className={`h-7 w-7 shrink-0 ${isActive(href) ? "text-white" : "text-white/80"}`} />
          <span className={`text-sm text-white/90 ${showLabels ? "inline ml-2" : labelClass(href)}`}>{label}</span>
        </Link>
      ))}
    </>
  );

  return (
    <>
      {/* Mobile top bar with hamburger */}
      <div className="md:hidden sticky top-0 z-30 w-full relative">
        <div className="flex items-center justify-between bg-[#171717] border-b border-white/10 px-3 py-2 rounded-md">
          <Link href="/app/hub" className="flex items-center gap-2" aria-label="BrickAI">
            <Image src="/favicon.png" alt="BrickAI" width={24} height={24} className="w-6 h-6" />
            <span className="text-sm font-semibold">BrickAI</span>
          </Link>
          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            className="h-9 w-9 inline-flex items-center justify-center rounded-md hover:bg-white/10 touch-manipulation"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {mobileOpen && (
          <div className="absolute left-0 right-0 top-full z-40 bg-[#171717] border border-white/10 rounded-md p-2 shadow-lg animate-[dropdown_180ms_ease-out] origin-top transform-gpu will-change-transform">
            <div className="flex flex-col gap-1">
              <NavLinks items={primaryNav} onClick={() => setMobileOpen(false)} showLabels />
              <Link
                href="/app/profile"
                aria-label="Profile"
                className="relative flex items-center h-10 w-full rounded-md hover:bg-white/10 px-2 touch-manipulation"
                onClick={() => setMobileOpen(false)}
              >
                <UserCircle className={`h-7 w-7 shrink-0 ${isActive("/app/profile") ? "text-white" : "text-white/80"}`} />
                <span className="text-sm text-white/90 inline ml-2">Profile</span>
              </Link>
            </div>
            <style jsx>{`
              @keyframes dropdown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
          </div>
        )}
      </div>

      {/* Tablet/Desktop pinned sidebar with hover/toggle expansion */}
      <div className="relative hidden md:block shrink-0 sticky top-0 self-start z-40">
        <aside
          className={`group flex flex-col justify-between ${widthClass} ${
            allowHoverExpand ? "lg:hover:w-56" : ""
          } transition-[width] duration-200 bg-[#171717] border-r border-white/10 px-2 py-2 h-[100dvh] overflow-y-auto overflow-x-hidden`}
          aria-label="Hubbar"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 0.5rem)" }}
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
              <NavLinks items={primaryNav} />
            </nav>
          </div>
          <div className="px-2 pb-2">
            <div className="flex items-center gap-1">
              <Link
                href="/app/profile"
                aria-label="Profile"
                className="relative flex items-center h-10 w-full rounded-md hover:bg-white/10 px-2"
              >
                <UserCircle className={`h-7 w-7 shrink-0 ${isActive("/app/profile") ? "text-white" : "text-white/80"}`} />
                <span className={`text-sm text-white/90 ${labelClass("/app/profile")}`}>Profile</span>
              </Link>
            </div>
          </div>
        </aside>
        {/* Toggle button outside the sidebar, poking out on the right */}
        <button
          type="button"
          aria-label={collapsed ? "Expand hubbar" : "Collapse hubbar"}
          aria-expanded={collapsed === false}
          onClick={() => setCollapsed((v) => !v)}
          className="absolute top-1/2 -translate-y-1/2 left-full -ml-px inline-flex items-center justify-center h-10 w-7 rounded-r-md border border-white/15 bg-white/5 hover:bg-white/10 text-white/90 shadow-sm z-50 pointer-events-auto"
          title={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>
    </>
  );
}

export default AppSidebar;
export const Hubbar = memo(AppSidebar);
