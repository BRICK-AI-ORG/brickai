"use client";

import React from "react";
import StatusCard from "@/components/StatusCard";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#121212]">
        <section className="py-20">
          <div className="mx-auto max-w-[900px] px-4 text-center">
            <div className="mb-6">
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">Were on it</h1>
              <p className="mt-3 text-muted-foreground">A critical error occurred. Well investigate immediately.</p>
            </div>
            <div className="mx-auto max-w-2xl text-left">
              <StatusCard
                code={500}
                title="Unexpected error"
                message={
                  <>
                    If this keeps happening, please let us know with details of what you were doing{error?.digest ? ` (ref: ${error.digest})` : ""}.
                  </>
                }
                copyText={`Global error 500: Unexpected error.${error?.digest ? ` Ref: ${error.digest}.` : ""}`}
                primary={{ label: "Try Again", href: "#" }}
                secondary={{ label: "Back to Home", href: "/home" }}
              />
              <div className="mt-4">
                <Button variant="outline" onClick={() => reset()}>Reload</Button>
              </div>
            </div>
            <div className="mt-6">
              <Link href="/contact"><Button variant="ghost" className="text-white/80 hover:text-white">Need help? Contact us</Button></Link>
            </div>
          </div>
        </section>
      </body>
    </html>
  );
}
