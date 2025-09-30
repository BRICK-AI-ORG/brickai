"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Action = { label: string; href: string; variant?: "default" | "outline" };

export function StatusCard({
  code,
  title,
  message,
  primary,
  secondary,
  className,
  copyText,
  appendContext = true,
}: {
  code: string | number;
  title: string;
  message: React.ReactNode;
  primary?: Action;
  secondary?: Action;
  className?: string;
  copyText?: string;
  appendContext?: boolean;
}) {
  const [copied, setCopied] = React.useState(false);
  const onCopy = async () => {
    try {
      const parts: string[] = [];
      if (copyText) parts.push(copyText);
      else parts.push(`Error ${code}: ${title}`);
      if (appendContext && typeof window !== "undefined") {
        parts.push(`URL: ${window.location.href}`);
        parts.push(`Time: ${new Date().toISOString()}`);
      }
      await navigator.clipboard.writeText(parts.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  return (
    <div className={cn("relative overflow-hidden rounded-2xl border bg-white/5", className)}>
      <div aria-hidden className="absolute inset-0 opacity-10 card-blend-bg" />
      <div className="relative p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center justify-center rounded-md border border-[#aa2ee2]/40 bg-[#aa2ee2]/10 px-2 py-0.5 text-[#aa2ee2] text-xs font-semibold">
            {code}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold">{title}</h1>
        </div>
        <p className="mt-3 text-sm sm:text-base text-muted-foreground">{message}</p>
        {(primary || secondary || copyText) && (
          <div className="mt-6 flex flex-wrap gap-2">
            {primary && (
              <Link href={primary.href} aria-label={primary.label}>
                <Button className="h-9 px-4 bg-[#aa2ee2] hover:bg-[#9322c8]">{primary.label}</Button>
              </Link>
            )}
            {secondary && (
              <Link href={secondary.href} aria-label={secondary.label}>
                <Button variant="outline" className="h-9 px-4">{secondary.label}</Button>
              </Link>
            )}
            {copyText && (
              <Button type="button" variant="ghost" className="h-9 px-3 text-white/80 hover:text-white" onClick={onCopy}>
                {copied ? "Copied!" : "Copy details"}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default StatusCard;
