"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SmokyBG from "@/components/SmokyBG";
import { Card, CardContent } from "@/components/ui/card";
import { Toaster } from "@/components/ui/toaster";
import TitleSetter from "@/components/TitleSetter";
import { usePathname } from "next/navigation";
import SessionActivityMonitor from "@/components/SessionActivityMonitor";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const wideRoutes = new Set(["/home", "/pricing", "/solutions", "/about", "/faqs", "/privacy-policy", "/terms-and-conditions", "/cookie-policy", "/contact", "/app/hub"]);
  const isWide = pathname ? wideRoutes.has(pathname) : false;
  const yPad = pathname === "/home" ? "py-0" : "py-8";
  const isAuth = pathname === "/login" || pathname === "/create-account";
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-[#121212]`}>
        <TitleSetter />
        <div className="relative isolate flex flex-col min-h-screen">
          {/* Full-viewport smoke background for /home and auth pages */}
          {(pathname === "/home" || isAuth) && (
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
          <Header />
          <main
            className={
              isWide
                ? `relative z-10 flex-grow mx-auto max-w-screen-2xl px-2 sm:px-4 ${yPad}`
                : `relative z-10 flex-grow container mx-auto px-4 ${yPad}`
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
          <Footer />
        </div>
        <Toaster />
        <SessionActivityMonitor />
      </body>
    </html>
  );
}
