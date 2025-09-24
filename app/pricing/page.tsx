import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function PricingPage() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-screen-2xl px-2 sm:px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">Pricing</h1>
          <p className="mt-4 text-muted-foreground">
            Choose the plan that fits your portfolio. Upgrade anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Basic</CardTitle>
              <div className="text-2xl font-bold">£32/month</div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>1 portfolio</li>
                <li>50 AI tasks/month</li>
                <li>1 GB storage</li>
                <li>Community support</li>
              </ul>
            </CardContent>
            <CardFooter className="justify-center">
              <Link href="/create-account" aria-label="Get Started - Basic">
                <Button variant="outline">Get Started</Button>
              </Link>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Middle</CardTitle>
              <div className="text-2xl font-bold">£89/month</div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>3 portfolios</li>
                <li>500 AI tasks/month</li>
                <li>10 GB storage</li>
                <li>Email support</li>
              </ul>
            </CardContent>
            <CardFooter className="justify-center">
              <Link href="/create-account" aria-label="Upgrade - Middle">
                <Button className="bg-[#242424] hover:bg-[#2a2a2a] text-white">Upgrade</Button>
              </Link>
            </CardFooter>
          </Card>

          <Card className="border-[#aa2ee2]/40">
            <CardHeader>
              <CardTitle className="text-xl">Advanced</CardTitle>
              <div className="text-2xl font-bold">£149/month</div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>10 portfolios</li>
                <li>2,000 AI tasks/month</li>
                <li>100 GB storage</li>
                <li>Priority support</li>
              </ul>
            </CardContent>
            <CardFooter className="justify-center">
              <Link href="/create-account" aria-label="Start Advanced - Advanced">
                <Button className="bg-[#aa2ee2] hover:bg-[#9322c8]">Start Advanced</Button>
              </Link>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Team</CardTitle>
              <div className="text-2xl font-bold">Contact us</div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>Unlimited portfolios</li>
                <li>10,000 AI tasks/month</li>
                <li>1 TB storage</li>
                <li>Dedicated support</li>
              </ul>
            </CardContent>
            <CardFooter className="justify-center">
              <Link href="/create-account" aria-label="Contact Us - Team">
                <Button variant="secondary">Contact Us</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  );
}
