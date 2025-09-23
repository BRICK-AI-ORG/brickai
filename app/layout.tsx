"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { RouteGuard } from "@/components/RouteGuard";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-[#121212]`}>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8">
            {/* Make wrapper transparent so global background shows through */}
            <Card className="w-full max-w-2xl mx-auto bg-transparent">
              <CardContent className="p-6">
                <RouteGuard>{children}</RouteGuard>
              </CardContent>
            </Card>
          </main>
          <Footer />
        </div>
        <Toaster />
      </body>
    </html>
  );
}
