"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState, memo } from "react";
import { Menu, X, Home, UserCircle, ChevronLeft, ChevronRight } from "lucide-react";

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
  // Collapsed by default; hydrate from storage when available
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    try {
      const stored = window.localStorage.getItem(HUBBAR_STATE_KEY);
      return stored === null ? true : stored !== "false";
    } catch {
      return true;
    }
  });
  const [textAnimation, setTextAnimation] = useState<"expand" | "collapse" | null>(null);
  const isActive = (href: string) => pathname === href;
  const toggleLabelReady = !collapsed && textAnimation === null;

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
      setCollapsed((prev) => {
        if (prev === nextCollapsed) return prev;
        setTextAnimation(nextCollapsed ? "collapse" : "expand");
        return nextCollapsed;
      });
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  useEffect(() => {
    if (!textAnimation) return;
    if (typeof window === "undefined") return;
    const timer = window.setTimeout(() => setTextAnimation(null), 240);
    return () => window.clearTimeout(timer);
  }, [textAnimation]);

  const primaryNav = useMemo(() => [{ href: "/app/hub", label: "Hub", Icon: Home }], []);

  const widthClass = collapsed ? "w-16" : "w-60";

  const renderNavLabel = (label: string, showLabels: boolean) => {
    if (showLabels) {
      return <span className="text-sm text-white/90">{label}</span>;
    }
    if (collapsed && textAnimation === null) return null;
    return (
      <span
        className="text-sm text-white/90 sidebar-label"
        data-collapsed={collapsed ? "true" : "false"}
        data-animation={textAnimation ?? undefined}
      >
        <span className="sidebar-label__text">{label}</span>
      </span>
    );
  };

  const handleToggle = () => {
    setTextAnimation(collapsed ? "expand" : "collapse");
    setCollapsed((value) => !value);
  };

  const NavLinks = ({ items, onClick, showLabels = false }: { items: { href: string; label: string; Icon: any }[]; onClick?: () => void; showLabels?: boolean }) => (
    <>
      {items.map(({ href, label, Icon }) => (
        <Link
          key={href}
          href={href}
          aria-label={label}
          className="relative flex items-center gap-2 h-10 w-full rounded-md hover:bg-white/10 px-2 touch-manipulation"
          onClick={onClick}
        >
          <NavIcon active={isActive(href)} />
          <Icon className={`h-7 w-7 shrink-0 ${isActive(href) ? "text-white" : "text-white/80"}`} />
          {renderNavLabel(label, showLabels)}
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
                className="relative flex items-center gap-2 h-10 w-full rounded-md hover:bg-white/10 px-2 touch-manipulation"
                onClick={() => setMobileOpen(false)}
              >
                <NavIcon active={isActive("/app/profile")} />
                <UserCircle className={`h-7 w-7 shrink-0 ${isActive("/app/profile") ? "text-white" : "text-white/80"}`} />
                {renderNavLabel("Profile", true)}
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
          className={`flex flex-col ${widthClass} transition-[width] duration-200 bg-[#171717] border-r border-white/10 px-3 py-3 h-[100dvh] overflow-y-auto overflow-x-hidden`}
          aria-label="Hubbar"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 0.5rem)" }}
        >
          <div className="mb-3">
            <button
              type="button"
              className={`inline-flex w-full items-center gap-2 rounded-md border border-white/10 bg-transparent px-2.5 py-2 text-xs font-medium text-white/70 transition-colors hover:bg-white/10 ${collapsed ? "justify-center" : "justify-start"}`}
              onClick={handleToggle}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-expanded={!collapsed}
            >
              {collapsed ? (
                <>
                  <ChevronRight className="h-5 w-5 text-white/70" />
                  <span className="sr-only">Open Sidebar</span>
                </>
              ) : (
                <>
                  <ChevronLeft className="h-5 w-5 text-white/70" />
                  <span
                    className={`text-sm font-semibold transition-opacity duration-150 ${toggleLabelReady ? "opacity-100" : "opacity-0"}`}
                    aria-hidden={!toggleLabelReady}
                  >
                    Close Sidebar
                  </span>
                  <span className="sr-only">Close Sidebar</span>
                </>
              )}
            </button>
          </div>
          <nav className="flex flex-col gap-1">
            <NavLinks items={primaryNav} />
          </nav>
          <div className="pb-2 mt-auto">
            <div className="flex items-center gap-1">
              <Link
                href="/app/profile"
                aria-label="Profile"
                className="relative flex items-center gap-2 h-10 w-full rounded-md hover:bg-white/10 px-2"
              >
                <NavIcon active={isActive("/app/profile")} />
                <UserCircle className={`h-7 w-7 shrink-0 ${isActive("/app/profile") ? "text-white" : "text-white/80"}`} />
                {renderNavLabel("Profile", false)}
              </Link>
            </div>
          </div>
        </aside>
        <style jsx>{`
          .sidebar-label {
            display: inline-flex;
            align-items: center;
            overflow: hidden;
            white-space: nowrap;
            max-width: 0;
            opacity: 0;
            visibility: hidden;
            transition:
              max-width 200ms cubic-bezier(0.4, 0, 0.2, 1),
              opacity 180ms ease-in-out;
          }

          .sidebar-label > .sidebar-label__text {
            display: inline-block;
            will-change: clip-path;
          }

          .sidebar-label[data-collapsed="false"],
          .sidebar-label[data-animation] {
            visibility: visible;
          }

          .sidebar-label[data-collapsed="false"],
          .sidebar-label[data-animation="expand"],
          .sidebar-label[data-animation="collapse"] {
            max-width: 16rem;
            opacity: 1;
          }

          .sidebar-label[data-animation="expand"] > .sidebar-label__text {
            animation: sidebar-text-reveal 200ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
          }

          .sidebar-label[data-animation="collapse"] > .sidebar-label__text {
            animation: sidebar-text-hide 200ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
          }

          @keyframes sidebar-text-reveal {
            from {
              clip-path: inset(0 100% 0 0);
            }
            to {
              clip-path: inset(0 0 0 0);
            }
          }

          @keyframes sidebar-text-hide {
            from {
              clip-path: inset(0 0 0 0);
            }
            to {
              clip-path: inset(0 100% 0 0);
            }
          }

        `}</style>
      </div>
    </>
  );
}

export default AppSidebar;
export const Hubbar = memo(AppSidebar);
