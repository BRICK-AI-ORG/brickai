"use client";

import React from "react";
import StatusCard from "@/components/StatusCard";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-[900px] px-4 text-center">
        <div className="mb-6">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">Something went wrong</h1>
          <p className="mt-3 text-muted-foreground">An unexpected error occurred while loading this page.</p>
        </div>
        <div className="mx-auto max-w-2xl text-left">
          <StatusCard
            code={500}
            title="We hit a snag"
            message={
              <>
                Our team has been notified{error?.digest ? ` (ref: ${error.digest})` : ""}. You can try again, or head back
                to the homepage.
              </>
            }
            copyText={`Error 500 (Internal Server Error): Unexpected server error.${error?.digest ? ` Ref: ${error.digest}.` : ""}`}
            primary={{ label: "Try Again", href: "#" }}
            secondary={{ label: "Back to Home", href: "/home" }}
          />
          <div className="mt-4">
            <Button variant="outline" onClick={() => reset()}>Refresh this page</Button>
          </div>
        </div>
        <div className="mt-6">
          <Link href="/contact"><Button variant="ghost" className="text-white/80 hover:text-white">Need help? Contact us</Button></Link>
        </div>
      </div>
    </section>
  );
}
