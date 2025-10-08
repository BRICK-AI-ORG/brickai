"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SmokyBG from "@/components/SmokyBG";
import { Card, CardContent } from "@/components/ui/card";
import { Toaster } from "@/components/ui/toaster";
import TitleSetter from "@/components/TitleSetter";
import { usePathname, useRouter } from "next/navigation";
import SessionActivityMonitor from "@/components/SessionActivityMonitor";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useProfileCompletion } from "@/hooks/useProfileCompletion";
import ZoomLock from "@/components/ZoomLock";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoggedIn, isLoading } = useAuth();
  const { status, loading: statusLoading } = useProfileCompletion();
  const isAppRoute = pathname?.startsWith("/app") ?? false;
  const wideRoutes = new Set([
    "/home",
    "/pricing",
    "/solutions",
    "/about",
    "/faqs",
    "/privacy-policy",
    "/terms-and-conditions",
    "/cookie-policy",
    "/contact",
    "/app/hub",
  ]);
  const isWide = pathname ? wideRoutes.has(pathname) || pathname.startsWith("/app") : false;
  const isAuth = pathname === "/login" || pathname === "/create-account";
  // Top padding:
  // - /home manages its own top spacing in-page (pt-10 on first section)
  // - Auth pages get a consistent pt-10 from the layout
  // - Other marketing pages manage their own top padding (set in-page)
  const yPadTop = pathname === "/home" ? "pt-0" : (isAuth ? "pt-10" : "pt-0");
  const yPadBottom = "pb-8";

  // If logged in, prevent access to any non-/app routes
  useEffect(() => {
    if (isLoading || statusLoading) return;
    if (isLoggedIn && pathname && !pathname.startsWith("/app")) {
      router.replace(status.complete ? "/app/hub" : "/app/welcome/complete-profile");
    }
  }, [isLoggedIn, isLoading, statusLoading, status?.complete, pathname, router]);
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-[#121212]`}>
        <TitleSetter />
        <ZoomLock />
        <div className="relative isolate flex flex-col min-h-screen">
          {/* Full-viewport smoke background for /home, auth pages, and all /app pages when logged in */}
          {(pathname === "/home" || isAuth || (isAppRoute && isLoggedIn)) && (
            <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
              <SmokyBG
                className="absolute inset-0"
                speed={1.8}
                blobs={5}
                minR={0.08}
                maxR={0.18}
                blurPx={40}
                opacity={0.28}
                centerAlpha={0.4}
              />
            </div>
          )}
          {!isAppRoute && <Header />}
          <main
            className={
              // Marketing + wide pages stay centered with a max width.
              // App (/app/**) pages should span the full viewport with no top padding
              // so the sidebar pins flush to the top.
              pathname?.startsWith("/app")
                ? `relative z-10 flex-grow w-full px-0 sm:px-0 py-0`
                : isWide
                ? `relative z-10 flex-grow mx-auto max-w-screen-2xl px-2 sm:px-4 ${yPadTop} ${yPadBottom}`
                : `relative z-10 flex-grow container mx-auto px-4 ${yPadTop} ${yPadBottom}`
            }
          >
            {isWide ? (
              children
            ) : (
              <Card className="outer-auth-card w-full max-w-2xl mx-auto">
                <CardContent className="p-6">{children}</CardContent>
              </Card>
            )}
          </main>
          {!isAppRoute && <Footer />}
        </div>
        <Toaster />
        <SessionActivityMonitor />
      </body>
    </html>
  );
}
