// page is server-side; child components manage client interactivity
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Flame } from "lucide-react";
import TiltCard from "@/components/ui/tilt-card";

export default function PricingPage() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-[1600px] px-2 sm:px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">Pricing</h1>
          <p className="mt-4 text-muted-foreground">Choose the plan that fits your portfolio. Upgrade anytime.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          <TiltCard intensity={4} glareOpacity={0.06}>
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle className="text-xl">Starter</CardTitle>
                <div className="text-2xl font-bold">&pound;32/month</div>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-2 text-sm">
                  <li>1 portfolio (max 5 properties total)</li>
                  <li>50 AI tasks/month</li>
                  <li>500 MB file storage</li>
                  <li>Email support</li>
                </ul>
              </CardContent>
              <CardFooter className="mt-auto justify-center">
                <Link href="/create-account" aria-label="Enter - Starter">
                  <Button variant="outline">Enter</Button>
                </Link>
              </CardFooter>
            </Card>
          </TiltCard>

          <TiltCard intensity={4} glareOpacity={0.06}>
            <Card className="h-full flex flex-col border-[#aa2ee2]/40">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-xl">Growth</CardTitle>
                  <div className="inline-flex items-center gap-1.5 rounded bg-[#aa2ee2]/15 text-[#aa2ee2] px-2 py-0.5">
                    <Users className="h-3 w-3" aria-hidden="true" />
                    <span className="text-[11px] font-medium tracking-wide">Most Popular!</span>
                  </div>
                </div>
                <div className="text-2xl font-bold">&pound;89/month</div>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-2 text-sm">
                  <li>3 portfolios (max 30 properties total)</li>
                  <li>100 AI tasks/month</li>
                  <li>2 GB file storage</li>
                  <li>Email support</li>
                </ul>
              </CardContent>
              <CardFooter className="mt-auto justify-center">
                <Link href="/create-account" aria-label="Coming Soon - Growth">
                  <Button className="bg-[#aa2ee2] hover:bg-[#9322c8]">Coming Soon</Button>
                </Link>
              </CardFooter>
            </Card>
          </TiltCard>

          <TiltCard intensity={4} glareOpacity={0.06}>
            <Card className="h-full flex flex-col border-[#ff7700]/40">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-xl">Pro</CardTitle>
                  <div className="inline-flex items-center gap-1.5 rounded bg-[#ff7700]/15 text-[#ff7700] px-2 py-0.5">
                    <Flame className="h-3 w-3" aria-hidden="true" />
                    <span className="text-[11px] font-medium tracking-wide">Best for investors!</span>
                  </div>
                </div>
                <div className="text-2xl font-bold">&pound;149/month</div>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-2 text-sm">
                  <li>10 portfolios (max 50 properties total)</li>
                  <li>200 AI tasks/month</li>
                  <li>10 GB file storage</li>
                  <li>Priority support</li>
                </ul>
              </CardContent>
              <CardFooter className="mt-auto justify-center">
                <Link href="/create-account" aria-label="Coming Soon - Pro">
                  <Button className="bg-[#ff7700] hover:bg-[#e56b00]">Coming Soon</Button>
                </Link>
              </CardFooter>
            </Card>
          </TiltCard>

          <TiltCard intensity={4} glareOpacity={0.06}>
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle className="text-xl">Team</CardTitle>
                <div className="text-2xl font-bold">Contact Us</div>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-2 text-sm">
                  <li>Unlimited portfolios</li>
                  <li>Unlimited properties</li>
                  <li>Custom AI task allowance</li>
                  <li>Unlimited file storage</li>
                  <li>Dedicated support</li>
                </ul>
              </CardContent>
              <CardFooter className="mt-auto justify-center">
                <Link href="/create-account" aria-label="Coming Soon - Team">
                  <Button variant="secondary">Coming Soon</Button>
                </Link>
              </CardFooter>
            </Card>
          </TiltCard>
        </div>
      </div>

      <div className="mt-12 flex justify-center">
        <TiltCard intensity={4} glareOpacity={0.06} className="w-full max-w-3xl sm:max-w-4xl">
          <div className="rounded-xl border p-6 sm:p-8 bg-background/60 text-center">
          <h2 className="text-2xl font-semibold">Add-Ons (all tiers)</h2>
            <ul className="mt-4 space-y-2 text-sm sm:text-base text-left">
              <li>Extra portfolio (beyond included cap)  &pound;15 / month each</li>
              <li>Extra property (beyond included cap)  &pound;4 / month each</li>
              <li>Extra AI tasks  &pound;10 / month per +50 tasks</li>
            </ul>
            <div className="mt-4 text-sm sm:text-base text-left font-medium">Storage:</div>
            <ul className="mt-2 space-y-2 text-sm sm:text-base text-left">
              <li>+1 GB  &pound;2 / month</li>
              <li>+5 GB  &pound;5 / month</li>
              <li>+20 GB  &pound;15 / month</li>
            </ul>
            <div className="mt-4 text-xs text-muted-foreground">Applies to all plans</div>
          </div>
        </TiltCard>
      </div>
    </section>
  );
}
