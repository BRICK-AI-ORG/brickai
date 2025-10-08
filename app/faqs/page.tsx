"use client";

import React from "react";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type FAQ = { q: string; a: React.ReactNode };

export default function FAQsPage() {
  const faqs: FAQ[] = [
    {
      q: "What is BrickAI?",
      a: (
        <>BrickAI is a property portfolio and workflow hub that brings analytics, automation, and AI assistance into one place.</>
      ),
    },
    {
      q: "How do I get started?",
      a: (
        <>Create your account and add your first portfolio. From there, import properties, documents, and start tracking projects.</>
      ),
    },
    {
      q: "Is there a free trial?",
      a: (
        <>We keep onboarding lightweight. You can create an account and explore, then choose a plan when you are ready.</>
      ),
    },
    {
      q: "Can I change plans later?",
      a: (
        <>Yes. You can upgrade or adjust as your needs grow, and changes take effect from your next billing cycle.</>
      ),
    },
    {
      q: "How does AI help?",
      a: (
        <>The AI assistant helps with summaries, data entry suggestions, and surfacing insights like anomalies or overdue items.</>
      ),
    },
    {
      q: "How do I contact support?",
      a: (
        <>
          Email <a className="underline" href="mailto:hello@brickai.app">hello@brickai.app</a> and we&#39;ll get back promptly.
          <div className="not-prose mt-3">
            <Link href="/contact" aria-label="Contact">
              <Button variant="outline" className="h-8 px-3">Contact us</Button>
            </Link>
          </div>
        </>
      ),
    },
  ];

  const [open, setOpen] = React.useState<Set<number>>(new Set());
  const toggle = (i: number) => {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  return (
    <section className="pt-10 pb-6">
      <div className="mx-auto max-w-[1000px]">
        <div className="mb-6 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">FAQs</h1>
          <p className="mt-3 text-muted-foreground">Quick answers to common questions</p>
        </div>

        <div className="space-y-3">
          {faqs.map((item, idx) => {
            const isOpen = open.has(idx);
            return (
              <div
                key={idx}
                className={`group relative overflow-hidden rounded-xl border bg-white/[0.03] transition-all duration-200 ${
                  isOpen ? "border-[#aa2ee2]/50" : "border-[#aa2ee2]/25"
                } hover:border-[#aa2ee2]/50 hover:shadow-[0_0_0_1px_rgba(170,46,226,0.28)_inset,0_10px_26px_-18px_rgba(170,46,226,0.28)]`}
              >
                <div aria-hidden className="absolute inset-0 opacity-0 group-hover:opacity-15 transition-opacity card-blend-bg"></div>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => toggle(idx)}
                  className="relative w-full flex items-center justify-between gap-3 px-4 sm:px-5 py-3 sm:py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#aa2ee2]/40"
                >
                  <span className="text-sm sm:text-base font-medium">{item.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 flex-shrink-0 transition-transform ${isOpen ? "rotate-180" : "rotate-0"}`}
                    aria-hidden
                  />
                </button>
                <div className={`relative px-4 sm:px-5 overflow-hidden transition-[max-height,opacity] duration-200 ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
                  <div className="pb-4 sm:pb-5 prose prose-invert prose-sm sm:prose-base text-muted-foreground prose-a:text-[#aa2ee2]">{item.a}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
