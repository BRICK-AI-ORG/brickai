"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/hooks/use-toast";

export default function ContactPage() {
  const { toast } = useToast();
  const [category, setCategory] = React.useState<string>("feedback");

  const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const categoryLabel: Record<string, string> = {
      feedback: "Feedback",
      problem: "Problem",
      billing: "Billing",
      feature: "Feature Request",
      other: "Other",
    };
    toast({
      title: "Message received (placeholder)",
      description: `Thanks for reaching out. Category: ${categoryLabel[category]}. This form is a demo and does not send email yet.`,
    });
    (e.currentTarget as HTMLFormElement).reset();
  };

  return (
    <section className="pt-10 pb-6">
      <div className="mx-auto max-w-[1000px] space-y-6">
        <header className="text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Contact</h1>
          <p className="mt-3 text-muted-foreground">We&apos;d love to hear from you</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-[#aa2ee2]/50">
            <CardContent className="p-4 sm:p-6">
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-1.5">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" name="name" required placeholder="Your full name" />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" required placeholder="you@example.com" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-1.5">
                    <Label htmlFor="category">Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger id="category" className="w-full">
                        <SelectValue placeholder="Choose a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="feedback">Feedback</SelectItem>
                        <SelectItem value="problem">Problem</SelectItem>
                        <SelectItem value="billing">Billing</SelectItem>
                        <SelectItem value="feature">Feature Request</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" name="subject" required placeholder="How can we help?" />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" name="message" required rows={6} placeholder="Write your message..." />
                </div>
                <div className="flex justify-end">
                  <Button className="bg-[#aa2ee2] hover:bg-[#9322c8]">Send Message</Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-4 text-sm sm:text-base">
            <Card className="border-white/15">
              <CardContent className="p-4 sm:p-6">
                <div className="font-medium">Email</div>
                <div className="text-muted-foreground">contact@example.com</div>
              </CardContent>
            </Card>
            <Card className="border-white/15">
              <CardContent className="p-4 sm:p-6">
                <div className="font-medium">Helpful Links</div>
                <ul className="mt-2 list-disc list-inside text-muted-foreground">
                  <li><Link className="underline" href="/faqs">FAQs</Link></li>
                  <li><Link className="underline" href="/pricing">Pricing</Link></li>
                  <li><Link className="underline" href="/solutions">Solutions</Link></li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
