"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";

export default function HomePage() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
          <span className="block">Manage your deals</span>
          <span className="block text-[#aa2ee2]">Scale your portfolio</span>
        </h1>
        <p className="mt-6 text-lg text-muted-foreground">
          BrickAI gives property investors a smarter way to scale. Centralize your deals, track progress, and collaborate seamlessly with your team. With AI-powered checklists, insights, and documentation, youll move faster, minimize risk, and grow your portfolio with confidence.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link href="/pricing" aria-label="View Pricing">
            <Button className="bg-[#aa2ee2] hover:bg-[#9322c8]">View Pricing</Button>
          </Link>
          <Link href="/login" aria-label="Login">
            <Button className="bg-[#242424] hover:bg-[#2a2a2a] text-white">Login</Button>
          </Link>
        </div>
        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-[#aa2ee2]" aria-hidden />
          <span>Trusted by property investors all over the UK</span>
        </div>
      </div>
    </section>
  );
}
