"use client";

import { useEffect, useRef, useState } from "react";
import { Copy, Lightbulb } from "lucide-react";

import { cn } from "@/lib/utils";

type SuggestionTickerProps = {
  suggestions: string[];
  interval?: number;
  className?: string;
  layout?: "default" | "compact";
};

export function SuggestionTicker({
  suggestions,
  interval = 5000,
  className,
  layout = "default",
}: SuggestionTickerProps) {
  const messages = suggestions.filter(Boolean);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const timeoutRef = useRef<number | null>(null);
  const copyTimeoutRef = useRef<number | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (messages.length === 0) return;
    if (index >= messages.length) setIndex(0);
  }, [index, messages.length]);

  useEffect(() => {
    if (messages.length <= 1) return;
    const handle = window.setInterval(() => {
      setVisible(false);
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(() => {
        setIndex((prev) => (prev + 1) % messages.length);
        setVisible(true);
      }, 180);
    }, interval);

    return () => {
      window.clearInterval(handle);
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [interval, messages.length]);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) window.clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  const currentMessage = messages[index] ?? "";

  const handleCopy = async () => {
    if (!currentMessage) return;
    try {
      if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) return;
      await navigator.clipboard.writeText(currentMessage);
      setCopied(true);
      if (copyTimeoutRef.current) window.clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // swallow copy failures silently
    }
  };

  if (messages.length === 0) return null;

  const compact = layout === "compact";

  return (
    <div
      className={cn(
        "rounded-md border-2 border-dotted border-[#aa2ee2] bg-[#101010] px-4 py-3 text-xs shadow-sm transition-colors",
        compact && "h-full px-3 py-2",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div
        className={cn(
          "flex items-center gap-2 text-xs font-semibold tracking-[0.18em]",
          compact ? "text-[10px] tracking-[0.08em]" : "uppercase"
        )}
      >
        <span className="relative flex h-6 w-6 items-center justify-center">
          <Lightbulb
            className={cn(
              "suggestion-bulb suggestion-gradient",
              compact ? "h-4 w-4" : "h-5 w-5"
            )}
            aria-hidden
          />
        </span>
        <span
          className={cn(
            "suggestion-label",
            compact ? "text-[12px] font-medium tracking-tight" : "text-sm font-medium"
          )}
        >
          Lost for words? See our suggestions
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className={cn(
            "ml-auto inline-flex items-center justify-center rounded-md border border-[#aa2ee2]/40 bg-transparent text-[#aa2ee2] transition hover:bg-[#aa2ee2]/10 focus:outline-none focus:ring-2 focus:ring-[#aa2ee2] focus:ring-offset-1 focus:ring-offset-[#101010]",
            compact ? "h-6 w-6 text-[11px]" : "h-7 w-7"
          )}
          aria-label="Copy suggestion"
          title={copied ? "Copied!" : "Copy suggestion"}
        >
          <Copy className={cn(copied ? "opacity-80" : "", compact ? "h-3.5 w-3.5" : "h-4 w-4")} aria-hidden />
        </button>
      </div>
      <div
        className={cn(
          "mt-2 text-sm font-medium suggestion-text transition-opacity duration-150 ease-in-out",
          compact && "mt-1 text-[12px]",
          visible ? "opacity-100" : "opacity-0"
        )}
      >
        {currentMessage}
      </div>
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        @keyframes bulbGlow {
          0%,
          100% {
            color: #aa2ee2;
          }
          50% {
            color: #22d3ee;
          }
        }
        .suggestion-label,
        .suggestion-text,
        .suggestion-gradient {
          background-image: linear-gradient(
            90deg,
            rgba(170, 46, 226, 0.25),
            rgba(34, 211, 238, 0.7),
            rgba(170, 46, 226, 0.25)
          );
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: shimmer 3s ease-in-out infinite;
        }
        .suggestion-label {
          font-size: ${compact ? "0.75rem" : "0.95rem"};
        }
        .suggestion-text { font-size: ${compact ? "0.75rem" : "0.95rem"}; }
        .suggestion-bulb {
          animation: bulbGlow 2.4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
