// server component
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import TiltCard from "@/components/ui/tilt-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Zap,
  Search,
  Sliders,
  Shield,
  Layers,
  Leaf,
  Heart,
  Globe,
  BarChart2,
  Calculator,
  Wrench,
  Sparkles,
  Database,
  Bot,
  LayoutDashboard,
  Quote as QuoteIcon,
} from "lucide-react";
import SmokyBG from "@/components/SmokyBG";

export default function AboutPage() {
  return (
    <section className="pt-10 pb-16">
      <div className="mx-auto max-w-[1600px] px-2 sm:px-4">
        {/* Hero */}
        <div className="group relative overflow-hidden rounded-2xl border bg-background/60 p-6 sm:p-10 text-center transition-all duration-200 hover:border-white/20 hover:shadow-[0_0_0_1px_rgba(170,46,226,0.35)_inset,0_20px_50px_-20px_rgba(34,211,238,0.35)]">
          <SmokyBG className="absolute -inset-32 z-0" speed={1.6} blobs={8} blurPx={38} opacity={0.32} />
          <h1 className="relative text-4xl sm:text-5xl font-extrabold tracking-tight">About BrickAI</h1>
          <p className="relative mt-4 text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto">
            We&apos;re building a next-generation property analytics and management platform for ambitious investors who
            want sharper insights, faster decisions, and more control.
          </p>
          <div className="relative mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link href="/solutions" aria-label="Explore Solutions">
              <Button variant="outline" className="h-9 px-4">Explore Solutions</Button>
            </Link>
            <Link href="/pricing" aria-label="View Pricing">
              <Button className="h-9 px-4 bg-[#aa2ee2] hover:bg-[#9322c8]">View Pricing</Button>
            </Link>
          </div>
        </div>

        {/* Capabilities as Tilt Cards */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <TiltCard intensity={4} glareOpacity={0.06}>
            <Card className="group relative overflow-hidden h-full flex flex-col transition-all duration-200 hover:border-white/20 hover:shadow-[0_0_0_1px_rgba(170,46,226,0.35)_inset,0_16px_40px_-20px_rgba(34,211,238,0.35)]">
              <div aria-hidden className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity card-blend-bg"></div>
              <CardHeader className="flex flex-row items-center gap-2">
                <BarChart2 className="h-5 w-5 text-violet-400" aria-hidden="true" />
                <CardTitle className="text-lg">Portfolio Performance</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Track performance across portfolios, properties, and projects in one place.
              </CardContent>
            </Card>
          </TiltCard>

          <TiltCard intensity={4} glareOpacity={0.06}>
            <Card className="group relative overflow-hidden h-full flex flex-col transition-all duration-200 hover:border-white/20 hover:shadow-[0_0_0_1px_rgba(170,46,226,0.35)_inset,0_16px_40px_-20px_rgba(34,211,238,0.35)]">
              <div aria-hidden className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity card-blend-bg"></div>
              <CardHeader className="flex flex-row items-center gap-2">
                <Calculator className="h-5 w-5 text-emerald-400" aria-hidden="true" />
                <CardTitle className="text-lg">Deal Analysis</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Run instant analysis with real-time metrics and scenario modelling.
              </CardContent>
            </Card>
          </TiltCard>

          <TiltCard intensity={4} glareOpacity={0.06}>
            <Card className="group relative overflow-hidden h-full flex flex-col transition-all duration-200 hover:border-white/20 hover:shadow-[0_0_0_1px_rgba(170,46,226,0.35)_inset,0_16px_40px_-20px_rgba(34,211,238,0.35)]">
              <div aria-hidden className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity card-blend-bg"></div>
              <CardHeader className="flex flex-row items-center gap-2">
                <Wrench className="h-5 w-5 text-orange-400" aria-hidden="true" />
                <CardTitle className="text-lg">Projects & Refurbs</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Manage refurbishments, budgets, and project pipelines with ease.
              </CardContent>
            </Card>
          </TiltCard>

          <TiltCard intensity={4} glareOpacity={0.06}>
            <Card className="group relative overflow-hidden h-full flex flex-col transition-all duration-200 hover:border-white/20 hover:shadow-[0_0_0_1px_rgba(170,46,226,0.35)_inset,0_16px_40px_-20px_rgba(34,211,238,0.35)]">
              <div aria-hidden className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity card-blend-bg"></div>
              <CardHeader className="flex flex-row items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-300" aria-hidden="true" />
                <CardTitle className="text-lg">AI Insights</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Surface opportunities, risks, and tailored recommendations automatically.
              </CardContent>
            </Card>
          </TiltCard>
        </div>

        {/* Pillars */}
        <div className="mt-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-center">What Powers BrickAI</h2>
          <p className="mt-2 text-center text-muted-foreground">Three pillars that make it all work together.</p>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <TiltCard intensity={4} glareOpacity={0.06}>
              <Card className="group relative overflow-hidden h-full flex flex-col transition-all duration-200 hover:border-white/20 hover:shadow-[0_0_0_1px_rgba(170,46,226,0.35)_inset,0_16px_40px_-20px_rgba(34,211,238,0.35)]">
                <div aria-hidden className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity card-blend-bg"></div>
                <CardHeader className="flex flex-row items-center gap-2">
                  <Database className="h-5 w-5 text-sky-400" aria-hidden="true" />
                  <CardTitle className="text-lg">Data Models</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Normalised structures for portfolios, properties, leases, tasks, and documents.
                </CardContent>
              </Card>
            </TiltCard>

            <TiltCard intensity={4} glareOpacity={0.06}>
              <Card className="group relative overflow-hidden h-full flex flex-col transition-all duration-200 hover:border-white/20 hover:shadow-[0_0_0_1px_rgba(170,46,226,0.35)_inset,0_16px_40px_-20px_rgba(34,211,238,0.35)]">
                <div aria-hidden className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity card-blend-bg"></div>
                <CardHeader className="flex flex-row items-center gap-2">
                  <Bot className="h-5 w-5 text-fuchsia-400" aria-hidden="true" />
                  <CardTitle className="text-lg">AI Assistant</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  AI-assisted tasks, summaries, and insights to keep work moving.
                </CardContent>
              </Card>
            </TiltCard>

            <TiltCard intensity={4} glareOpacity={0.06}>
              <Card className="group relative overflow-hidden h-full flex flex-col transition-all duration-200 hover:border-white/20 hover:shadow-[0_0_0_1px_rgba(170,46,226,0.35)_inset,0_16px_40px_-20px_rgba(34,211,238,0.35)]">
                <div aria-hidden className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity card-blend-bg"></div>
                <CardHeader className="flex flex-row items-center gap-2">
                  <LayoutDashboard className="h-5 w-5 text-lime-400" aria-hidden="true" />
                  <CardTitle className="text-lg">Portfolio Hub</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  A unified workspace for tasks, notes, files, and status updates.
                </CardContent>
              </Card>
            </TiltCard>
          </div>
        </div>

        {/* Values carousel */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold tracking-tight text-center">Built on Practical Values</h2>
          <p className="mt-2 text-center text-muted-foreground">A quick tour - subtle auto-scroll, hover to pause.</p>

          {/* Mobile: vertical auto-scroll */}
          <div className="md:hidden mt-4 pause-on-hover">
            <div className="relative h-64 overflow-hidden rounded-xl border border-white/10 bg-white/5 p-3">
              <SmokyBG className="absolute -inset-24 z-0" speed={1.4} blobs={7} blurPx={32} opacity={0.28} />
              <div className="relative z-10 flex flex-col gap-3 animate-marquee-y will-change-transform">
                {[...Array(2)].map((_, pass) => (
                  <React.Fragment key={pass}>
                    <ValueItem label="Speed" icon={<Zap className="h-4 w-4 text-[#22d3ee]" />} color="#22d3ee" desc="Move faster with streamlined workflows and shortcuts." />
                    <ValueItem label="Clarity" icon={<Search className="h-4 w-4 text-[#aa2ee2]" />} color="#aa2ee2" desc="See status and context clearly, without digging." />
                    <ValueItem label="Control" icon={<Sliders className="h-4 w-4 text-[#22d3ee]" />} color="#22d3ee" desc="Shape processes to your strategy - not the other way round." />
                    <ValueItem label="Security" icon={<Shield className="h-4 w-4 text-[#aa2ee2]" />} color="#aa2ee2" desc="Protect data with sensible defaults and strong boundaries." />
                    <ValueItem label="Scalability" icon={<Layers className="h-4 w-4 text-[#22d3ee]" />} color="#22d3ee" desc="Grow portfolios and teams with confidence." />
                    <ValueItem label="Sustainability" icon={<Leaf className="h-4 w-4 text-[#22d3ee]" />} color="#22d3ee" desc="Build for longevity and efficient, responsible operations." />
                    <ValueItem label="Investor Care" icon={<Heart className="h-4 w-4 text-[#aa2ee2]" />} color="#aa2ee2" desc="Respect investor time, capital, and data with clear controls." />
                    <ValueItem label="Market Knowledge" icon={<Globe className="h-4 w-4 text-[#22d3ee]" />} color="#22d3ee" desc="Reflect real market workflows and terminology that pros use." />
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop: horizontal auto-scroll */}
          <div className="hidden md:block mt-6 pause-on-hover">
            <div className="relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-3">
              <SmokyBG className="absolute -inset-24 z-0" speed={1.4} blobs={7} blurPx={32} opacity={0.28} />
              <div className="relative z-10 inline-flex gap-3 animate-marquee-x will-change-transform">
                {[...Array(2)].map((_, pass) => (
                  <React.Fragment key={pass}>
                    <ValueCard label="Speed" icon={<Zap className="h-4 w-4 text-[#22d3ee]" />} color="#22d3ee" desc="Move faster with streamlined workflows and shortcuts." />
                    <ValueCard label="Clarity" icon={<Search className="h-4 w-4 text-[#aa2ee2]" />} color="#aa2ee2" desc="See status and context clearly, without digging." />
                    <ValueCard label="Control" icon={<Sliders className="h-4 w-4 text-[#22d3ee]" />} color="#22d3ee" desc="Shape processes to your strategy - not the other way round." />
                    <ValueCard label="Security" icon={<Shield className="h-4 w-4 text-[#aa2ee2]" />} color="#aa2ee2" desc="Protect data with sensible defaults and strong boundaries." />
                    <ValueCard label="Scalability" icon={<Layers className="h-4 w-4 text-[#22d3ee]" />} color="#22d3ee" desc="Grow portfolios and teams with confidence." />
                    <ValueCard label="Sustainability" icon={<Leaf className="h-4 w-4 text-[#22d3ee]" />} color="#22d3ee" desc="Build for longevity and efficient, responsible operations." />
                    <ValueCard label="Investor Care" icon={<Heart className="h-4 w-4 text-[#aa2ee2]" />} color="#aa2ee2" desc="Respect investor time, capital, and data with clear controls." />
                    <ValueCard label="Market Knowledge" icon={<Globe className="h-4 w-4 text-[#22d3ee]" />} color="#22d3ee" desc="Reflect real market workflows and terminology that pros use." />
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Simple timeline / getting started */}
        <div className="mt-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-center">Getting Started Is Simple</h2>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {["Create your account", "Add your first portfolio", "Automate and iterate"].map((title, i) => (
              <TiltCard key={i} intensity={4} glareOpacity={0.06}>
                <Card className="group relative overflow-hidden h-full flex flex-col transition-all duration-200 hover:border-white/20 hover:shadow-[0_0_0_1px_rgba(170,46,226,0.35)_inset,0_16px_40px_-20px_rgba(34,211,238,0.35)]">
                  <div aria-hidden className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity card-blend-bg"></div>
                  <CardHeader>
                    <CardTitle className="text-lg"><span className="text-white/60 mr-2">{i + 1}.</span>{title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    {i === 0 && (<>Start with the essentials - no credit card required for signup.</>)}
                    {i === 1 && (<>Bring in properties and projects; organise tasks and documents in one place.</>)}
                    {i === 2 && (<>Use AI to triage, summarise, and surface insights as your data grows.</>)}
                  </CardContent>
                </Card>
              </TiltCard>
            ))}
          </div>
        </div>

        {/* Quote */}
        <div className="mt-12">
          <TiltCard intensity={3} glareOpacity={0.05}>
            <div className="rounded-xl border p-6 sm:p-8 bg-background/60">
              <div className="flex items-start gap-3">
                <QuoteIcon className="w-6 h-6 text-white/40" aria-hidden="true" />
                <p className="text-base sm:text-lg text-foreground/90">
                  Our mission is simple: give property investors the kind of smart, data-driven tools that big
                  institutions use - but make them accessible, scalable, and built around real investor workflows.
                  BrickAI is for those who want to think bigger, grow faster, and build stronger portfolios - all
                  powered by intelligent software.
                </p>
              </div>
            </div>
          </TiltCard>
        </div>
      </div>
    </section>
  );
}

type ValueBase = {
  label: string;
  desc: string;
  icon: React.ReactNode;
  color: string; // hex accent for icon context
};

function ValueItem({ label, desc, icon }: ValueBase) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/5 p-3 hover:bg-white/10 transition-colors">
      <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-md bg-white/10 border border-white/10">
        {icon}
      </div>
      <div>
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
    </div>
  );
}

function ValueCard({ label, desc, icon }: ValueBase) {
  return (
    <div className="min-w-[220px]">
      <div className="rounded-lg border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition-colors">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white/10 border border-white/10">
            {icon}
          </div>
          <div className="text-sm font-medium">{label}</div>
        </div>
        <div className="mt-2 text-xs text-muted-foreground">{desc}</div>
      </div>
    </div>
  );
}
