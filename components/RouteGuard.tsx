"use client";

import { useAuth } from "@/hooks/useAuth";
import { useProfileCompletion } from "@/hooks/useProfileCompletion";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import FunLoader from "./FunLoader";

const PUBLIC_ROUTES = [
  "/",
  "/home",
  "/login",
  "/create-account",
  "/pricing",
  "/solutions",
  "/about",
  "/faqs",
  "/terms-and-conditions",
  "/privacy-policy",
  "/cookie-policy",
  "/contact",
];
const DEFAULT_AUTHENTICATED_ROUTE = "/app/hub";
const ONBOARDING_ROUTE = "/app/welcome/complete-profile";
const DEFAULT_PUBLIC_ROUTE = "/login";

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, isLoading } = useAuth();
  const { status, loading: statusLoading } = useProfileCompletion();
  const pathname = usePathname();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  // Read session flag synchronously to avoid redirect race on first render
  const [completedOverride, setCompletedOverride] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      const flag = sessionStorage.getItem("profileCompleted") === "1";
      if (flag) sessionStorage.removeItem("profileCompleted");
      return !!flag;
    } catch {
      return false;
    }
  });

  // Check sessionStorage flag set immediately after finishing onboarding to avoid race
  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      const flag = sessionStorage.getItem("profileCompleted") === "1";
      setCompletedOverride((prev) => prev || !!flag);
      if (flag) sessionStorage.removeItem("profileCompleted");
    } catch {}
  }, [pathname]);

  useEffect(() => {
    if (isLoading) return;

    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
    const isOnboarding = pathname.startsWith("/app/welcome");

    // If logged in and on marketing/auth pages, send to hub or onboarding
    if (isLoggedIn && (pathname === "/" || pathname === DEFAULT_PUBLIC_ROUTE || pathname === "/create-account" || pathname === "/home")) {
      if (!statusLoading && status && !(status.complete || completedOverride)) {
        router.replace(ONBOARDING_ROUTE);
      } else {
        router.replace(DEFAULT_AUTHENTICATED_ROUTE);
      }
    } else if (!isLoggedIn && !isPublicRoute) {
      router.replace(DEFAULT_PUBLIC_ROUTE);
    } else if (isLoggedIn && !statusLoading) {
      // In-app redirects based on completion
      if (!(status?.complete || completedOverride)) {
        if (!isOnboarding) router.replace(ONBOARDING_ROUTE);
        else setIsReady(true); // already on onboarding, allow render
      } else {
        if (isOnboarding) router.replace(DEFAULT_AUTHENTICATED_ROUTE);
        else setIsReady(true); // completed and not on onboarding, allow render
      }
    } else {
      setIsReady(true);
    }
  }, [isLoggedIn, isLoading, statusLoading, status, completedOverride, pathname, router]);

  if (!isReady) return <FunLoader />;

  return <>{children}</>;
}
