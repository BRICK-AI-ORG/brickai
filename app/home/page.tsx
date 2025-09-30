"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  Bot,
  Building2,
  FileText,
  Users,
  Plug,
  Home,
  LineChart,
  Sparkles,
} from "lucide-react";
import TiltCard from "@/components/ui/tilt-card";
import SmokyBG from "@/components/SmokyBG";

export default function HomePage() {
  return (
    <>
      {/* Page-scrolling animated smoke background */}
      <div className="relative">
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-screen h-full z-0 overflow-hidden">
          <SmokyBG className="absolute inset-0" speed={1.8} blobs={5} minR={0.08} maxR={0.18} blurPx={40} opacity={0.28} centerAlpha={0.4} />
        </div>
      <section className="py-10">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
            <span className="block">Manage your deals</span>
            <span className="block text-[#aa2ee2]">Scale your portfolio</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            BrickAI gives property investors a smarter way to scale. Centralize your deals, track progress, and collaborate seamlessly with your team. With AI-powered checklists, insights, and documentation, you&apos;ll move faster, minimize risk, and grow your portfolio with confidence.
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

      <section className="py-6">
        <div className="mx-auto max-w-6xl px-2 sm:px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold tracking-tight">What BrickAI Does</h2>
            <p className="mt-3 text-muted-foreground">Powerful tools built for portfolios, deals, and operations.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <TiltCard intensity={6} glareOpacity={0.08}>
              <div className="rounded-xl border p-5 bg-background/60">
                <div className="flex items-center gap-2 font-semibold">
                  <Bot className="h-4 w-4 text-[#aa2ee2]" /> AI Tasks & Automations
                </div>
                <p className="mt-2 text-sm text-muted-foreground">Generate checklists, extract data, summarize documents, and automate follow-ups with AI.</p>
              </div>
            </TiltCard>

            <TiltCard intensity={6} glareOpacity={0.08}>
              <div className="rounded-xl border p-5 bg-background/60">
                <div className="flex items-center gap-2 font-semibold">
                  <Building2 className="h-4 w-4 text-[#aa2ee2]" /> Portfolio Management
                </div>
                <p className="mt-2 text-sm text-muted-foreground">Track properties, yields, tasks, and notes in one place - across multiple portfolios.</p>
              </div>
            </TiltCard>

            <TiltCard intensity={6} glareOpacity={0.08}>
              <div className="rounded-xl border p-5 bg-background/60">
                <div className="flex items-center gap-2 font-semibold">
                  <FileText className="h-4 w-4 text-[#aa2ee2]" /> Documents & Media
                </div>
                <p className="mt-2 text-sm text-muted-foreground">Attach photos and PDFs, auto-tag with AI, and keep everything searchable.</p>
              </div>
            </TiltCard>

            <TiltCard intensity={6} glareOpacity={0.08}>
              <div className="rounded-xl border p-5 bg-background/60">
                <div className="flex items-center gap-2 font-semibold">
                  <Users className="h-4 w-4 text-[#aa2ee2]" /> Collaboration
                </div>
                <p className="mt-2 text-sm text-muted-foreground">Work with partners and teammates with roles, mentions, and activity trails.</p>
              </div>
            </TiltCard>

            <TiltCard intensity={6} glareOpacity={0.08}>
              <div className="rounded-xl border p-5 bg-background/60">
                <div className="flex items-center gap-2 font-semibold">
                  <Plug className="h-4 w-4 text-[#aa2ee2]" /> Integrations
                </div>
                <p className="mt-2 text-sm text-muted-foreground">Supabase-powered backend with Stripe subscriptions and API access from day one.</p>
              </div>
            </TiltCard>

            <TiltCard intensity={6} glareOpacity={0.08}>
              <div className="rounded-xl border p-5 bg-background/60">
                <div className="flex items-center gap-2 font-semibold">
                  <ShieldCheck className="h-4 w-4 text-[#aa2ee2]" /> Security
                </div>
                <p className="mt-2 text-sm text-muted-foreground">Row-level security, access controls, and sensible defaults for privacy.</p>
              </div>
            </TiltCard>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-6xl px-2 sm:px-4 space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">Built for Serious Portfolios</h2>
            <p className="mt-3 text-muted-foreground">Model returns, manage pipeline, and surface insights with responsive visuals.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Portfolio Modelling */}
            <TiltCard intensity={10} glareOpacity={0.1}>
              <div className="relative overflow-hidden rounded-2xl border p-6 sm:p-8 bg-background/60">
                <div className="relative z-10">
                  <div className="flex items-center gap-3">
                    <LineChart className="h-7 w-7 text-[#aa2ee2]" />
                    <h3 className="text-2xl font-semibold">Portfolio Modelling</h3>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">Run scenarios, stress-test yields, and visualize cashflow across portfolios. Compare LTV, cap rates, and growth assumptions in one place.</p>
                  <ul className="mt-3 text-sm list-disc pl-5 text-muted-foreground">
                    <li>Sensitivity analysis by rent, rate, and costs</li>
                    <li>Projected returns and IRR over time</li>
                    <li>What-if planning for acquisitions and exits</li>
                  </ul>
                </div>
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                  style={{
                    background:
                      "radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(170,46,226,0.12), transparent 50%)",
                  }}
                />
              </div>
            </TiltCard>

            {/* Property / Homes */}
            <TiltCard intensity={10} glareOpacity={0.1}>
              <div className="relative overflow-hidden rounded-2xl border p-6 sm:p-8 bg-background/60">
                <div className="relative z-10">
                  <div className="flex items-center gap-3">
                    <Home className="h-7 w-7 text-[#aa2ee2]" />
                    <h3 className="text-2xl font-semibold">Property Pipeline</h3>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">Track each home from lead to completion with AI-assisted checklists, docs, and valuations. Keep your pipeline moving.</p>
                  <ul className="mt-3 text-sm list-disc pl-5 text-muted-foreground">
                    <li>Stage-based workflow with automations</li>
                    <li>Smart document extraction for comps and DD</li>
                    <li>Team notes, mentions, and activity trails</li>
                  </ul>
                </div>
                <div className="absolute -right-6 -bottom-6 sm:-right-10 sm:-bottom-8 opacity-20 group-hover:opacity-30 transition-opacity duration-200">
                  <Home className="h-32 w-32 sm:h-40 sm:w-40 text-[#aa2ee2] transform transition-transform duration-200 group-hover:scale-105" />
                </div>
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                  style={{
                    background:
                      "radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(255,255,255,0.10), transparent 50%)",
                  }}
                />
              </div>
            </TiltCard>

            {/* AI Insights */}
            <TiltCard intensity={10} glareOpacity={0.1}>
              <div className="relative overflow-hidden rounded-2xl border p-6 sm:p-8 bg-background/60">
                <div className="relative z-10">
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-7 w-7 text-[#aa2ee2]" />
                    <h3 className="text-2xl font-semibold">AI Insights</h3>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">Summaries, risk flags, and action items—pulled out of your files, messages, and tasks, right when you need them.</p>
                  <ul className="mt-3 text-sm list-disc pl-5 text-muted-foreground">
                    <li>Context-aware suggestions across deals</li>
                    <li>Search that understands wording, not just keywords</li>
                    <li>Custom prompts per portfolio</li>
                  </ul>
                </div>
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                  style={{
                    background:
                      "radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(170,46,226,0.10), transparent 50%)",
                  }}
                />
              </div>
            </TiltCard>

            {/* Data Integrations */}
            <TiltCard intensity={10} glareOpacity={0.1}>
              <div className="relative overflow-hidden rounded-2xl border p-6 sm:p-8 bg-background/60">
                <div className="relative z-10">
                  <div className="flex items-center gap-3">
                    <Plug className="h-7 w-7 text-[#aa2ee2]" />
                    <h3 className="text-2xl font-semibold">Data & Integrations</h3>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">Bring your data together. Supabase core, Stripe for billing, API access for your own tools.</p>
                  <ul className="mt-3 text-sm list-disc pl-5 text-muted-foreground">
                    <li>Event-driven automations</li>
                    <li>Import/export with schema validation</li>
                    <li>Secure API keys per user/team</li>
                  </ul>
                </div>
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                  style={{
                    background:
                      "radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(255,255,255,0.08), transparent 50%)",
                  }}
                />
              </div>
            </TiltCard>
          </div>
        </div>
      </section>
      </div>
    </>
  );
}
