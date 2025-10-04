// server component; content is static
import React from "react";
import TiltCard from "@/components/ui/tilt-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, BarChart2, Clock } from "lucide-react";
import EqualizeHeights from "@/components/EqualizeHeights";

export default function SolutionsPage() {
  return (
    <section className="py-16">
      <EqualizeHeights targetClass="solutions-card" />
      <EqualizeHeights targetClass="solutions-outcome-card" />
      <div className="mx-auto max-w-[1600px] px-2 sm:px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">Solutions</h1>
          <p className="mt-4 text-muted-foreground">
            Practical use cases for property professionals: automate admin, improve visibility, and move faster.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          <TiltCard intensity={4} glareOpacity={0.06}>
            <Card className="solutions-card group relative overflow-hidden h-full flex flex-col transition-all duration-200 hover:border-white/20 hover:shadow-[0_0_0_1px_rgba(170,46,226,0.35)_inset,0_16px_40px_-20px_rgba(34,211,238,0.35)]">
              <div aria-hidden className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity card-blend-bg"></div>
              <CardHeader>
                <CardTitle className="text-xl">Landlords</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm mb-3 text-muted-foreground">
                  Streamline tenant onboarding and stay on top of renewals and compliance without spreadsheets.
                </p>
                <ul className="space-y-2 text-sm">
                  <li>Tenant onboarding checklists</li>
                  <li>Renewal and inspection reminders</li>
                  <li>Centralised document storage</li>
                </ul>
              </CardContent>
            </Card>
          </TiltCard>

          <TiltCard intensity={4} glareOpacity={0.06}>
            <Card className="solutions-card group relative overflow-hidden h-full flex flex-col transition-all duration-200 hover:border-white/20 hover:shadow-[0_0_0_1px_rgba(170,46,226,0.35)_inset,0_16px_40px_-20px_rgba(34,211,238,0.35)]">
              <div aria-hidden className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity card-blend-bg"></div>
              <CardHeader>
                <CardTitle className="text-xl">Property Managers</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm mb-3 text-muted-foreground">
                  Manage maintenance workflows end-to-end - from requests and triage to vendor coordination.
                </p>
                <ul className="space-y-2 text-sm">
                  <li>Maintenance ticketing & triage</li>
                  <li>Task assignment & SLAs</li>
                  <li>Vendor communication logs</li>
                </ul>
              </CardContent>
            </Card>
          </TiltCard>

          <TiltCard intensity={4} glareOpacity={0.06}>
            <Card className="solutions-card group relative overflow-hidden h-full flex flex-col transition-all duration-200 hover:border-white/20 hover:shadow-[0_0_0_1px_rgba(170,46,226,0.35)_inset,0_16px_40px_-20px_rgba(34,211,238,0.35)]">
              <div aria-hidden className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity card-blend-bg"></div>
              <CardHeader>
                <CardTitle className="text-xl">Letting Agents</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm mb-3 text-muted-foreground">
                  Accelerate lettings with standardised steps for listings, viewings, and applicant screening.
                </p>
                <ul className="space-y-2 text-sm">
                  <li>Listing and viewing workflows</li>
                  <li>Applicant screening templates</li>
                  <li>Offer and referencing tracking</li>
                </ul>
              </CardContent>
            </Card>
          </TiltCard>

          <TiltCard intensity={4} glareOpacity={0.06}>
            <Card className="solutions-card group relative overflow-hidden h-full flex flex-col transition-all duration-200 hover:border-white/20 hover:shadow-[0_0_0_1px_rgba(170,46,226,0.35)_inset,0_16px_40px_-20px_rgba(34,211,238,0.35)]">
              <div aria-hidden className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity card-blend-bg"></div>
              <CardHeader>
                <CardTitle className="text-xl">Investors</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm mb-3 text-muted-foreground">
                  Evaluate deals, monitor KPIs, and keep your portfolio strategy on track.
                </p>
                <ul className="space-y-2 text-sm">
                  <li>Deal notes & assumptions</li>
                  <li>Capex plans and returns</li>
                  <li>Hold/sell review workflows</li>
                </ul>
              </CardContent>
            </Card>
          </TiltCard>

          <TiltCard intensity={4} glareOpacity={0.06}>
            <Card className="solutions-card group relative overflow-hidden h-full flex flex-col transition-all duration-200 hover:border-white/20 hover:shadow-[0_0_0_1px_rgba(170,46,226,0.35)_inset,0_16px_40px_-20px_rgba(34,211,238,0.35)]">
              <div aria-hidden className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity card-blend-bg"></div>
              <CardHeader>
                <CardTitle className="text-xl">Facilities & Ops</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm mb-3 text-muted-foreground">
                  Schedule inspections, track works, and share status updates with stakeholders.
                </p>
                <ul className="space-y-2 text-sm">
                  <li>Planned maintenance calendars</li>
                  <li>Works progress & photos</li>
                  <li>Compliance evidence trail</li>
                </ul>
              </CardContent>
            </Card>
          </TiltCard>

          <TiltCard intensity={4} glareOpacity={0.06}>
            <Card className="solutions-card group relative overflow-hidden h-full flex flex-col transition-all duration-200 hover:border-white/20 hover:shadow-[0_0_0_1px_rgba(170,46,226,0.35)_inset,0_16px_40px_-20px_rgba(34,211,238,0.35)]">
              <div aria-hidden className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity card-blend-bg"></div>
              <CardHeader>
                <CardTitle className="text-xl">Finance & Admin</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm mb-3 text-muted-foreground">
                  Keep the numbers tight with consistent workflows and a clean audit trail.
                </p>
                <ul className="space-y-2 text-sm">
                  <li>Rent and invoice tracking</li>
                  <li>Expense receipts & approvals</li>
                  <li>Month-end task checklist</li>
                </ul>
              </CardContent>
            </Card>
          </TiltCard>
        </div>
      </div>

      <div className="mt-12 mx-auto max-w-[1600px] px-2 sm:px-4">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-center">Outcome Highlights</h2>
        <p className="mt-2 text-center text-muted-foreground">
          Tangible improvements teams see after adopting BrickAI.
        </p>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <TiltCard intensity={4} glareOpacity={0.06}>
            <Card className="solutions-outcome-card group relative overflow-hidden h-full transition-all duration-200 hover:border-white/20 hover:shadow-[0_0_0_1px_rgba(170,46,226,0.35)_inset,0_16px_40px_-20px_rgba(34,211,238,0.35)]">
              <div aria-hidden className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity card-blend-bg"></div>
              <CardHeader className="flex flex-row items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" aria-hidden="true" />
                <CardTitle className="text-lg">Less Admin</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Standardised workflows replace ad-hoc lists and emails. Keep work moving with prompts and reminders.
              </CardContent>
            </Card>
          </TiltCard>

          <TiltCard intensity={4} glareOpacity={0.06}>
            <Card className="solutions-outcome-card group relative overflow-hidden h-full transition-all duration-200 hover:border-white/20 hover:shadow-[0_0_0_1px_rgba(170,46,226,0.35)_inset,0_16px_40px_-20px_rgba(34,211,238,0.35)]">
              <div aria-hidden className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity card-blend-bg"></div>
              <CardHeader className="flex flex-row items-center gap-2">
                <Clock className="w-5 h-5 text-sky-400" aria-hidden="true" />
                <CardTitle className="text-lg">Faster Turnarounds</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Triage and assign tasks quickly. Resolve maintenance items faster with clear SLAs and ownership.
              </CardContent>
            </Card>
          </TiltCard>

          <TiltCard intensity={4} glareOpacity={0.06}>
            <Card className="solutions-outcome-card group relative overflow-hidden h-full transition-all duration-200 hover:border-white/20 hover:shadow-[0_0_0_1px_rgba(170,46,226,0.35)_inset,0_16px_40px_-20px_rgba(34,211,238,0.35)]">
              <div aria-hidden className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity card-blend-bg"></div>
              <CardHeader className="flex flex-row items-center gap-2">
                <BarChart2 className="w-5 h-5 text-violet-400" aria-hidden="true" />
                <CardTitle className="text-lg">Better Oversight</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Centralised status, documents, and notes. See where work stands and what is at risk in one place.
              </CardContent>
            </Card>
          </TiltCard>
        </div>
      </div>
    </section>
  );
}
