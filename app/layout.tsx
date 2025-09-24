"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { RouteGuard } from "@/components/RouteGuard";
import { Toaster } from "@/components/ui/toaster";
import TitleSetter from "@/components/TitleSetter";
import { usePathname } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const wideRoutes = new Set(["/home", "/pricing"]);
  const isWide = pathname ? wideRoutes.has(pathname) : false;
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-[#121212]`}>
        <TitleSetter />
        <div className="flex flex-col min-h-screen">
          <Header />
          <main
            className={
              isWide
                ? "flex-grow mx-auto max-w-screen-2xl px-2 sm:px-4 py-8"
                : "flex-grow container mx-auto px-4 py-8"
            }
          >
            {isWide ? (
              <RouteGuard>{children}</RouteGuard>
            ) : (
              <Card className="w-full max-w-2xl mx-auto">
                <CardContent className="p-6">
                  <RouteGuard>{children}</RouteGuard>
                </CardContent>
              </Card>
            )}
          </main>
          <Footer />
        </div>
        <Toaster />
      </body>
    </html>
  );
}
