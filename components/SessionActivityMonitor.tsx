"use client";

import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { toast } from "@/components/hooks/use-toast";

// Inactivity thresholds
const USE_SHORT_TIMEOUT = false; // 30-min policy active

// Long policy
const TIMEOUT_MS_LONG = 30 * 60 * 1000; // 30 minutes
const WARN_5_MS_LONG = TIMEOUT_MS_LONG - 5 * 60 * 1000; // 25 minutes
const WARN_1_MS_LONG = TIMEOUT_MS_LONG - 1 * 60 * 1000; // 29 minutes

// Short policy (current): 2 minutes total, 1-minute warning
const TIMEOUT_MS_SHORT = 2 * 60 * 1000; // 2 minutes
const WARN_1_MS_SHORT = TIMEOUT_MS_SHORT - 1 * 60 * 1000; // 1 minute

export default function SessionActivityMonitor() {
  const { isLoggedIn, signOut } = useAuth();
  const router = useRouter();

  const lastActivityRef = React.useRef<number>(Date.now());
  const warn5Ref = React.useRef<number | null>(null);
  const warn1Ref = React.useRef<number | null>(null);
  const timeoutRef = React.useRef<number | null>(null);
  const warn5ToastRef = React.useRef<{ id: string; dismiss: () => void } | null>(null);
  const warn1ToastRef = React.useRef<{ id: string; dismiss: () => void } | null>(null);

  const resetTimers = React.useCallback(() => {
    // Clear pending timers
    if (warn5Ref.current) window.clearTimeout(warn5Ref.current);
    if (warn1Ref.current) window.clearTimeout(warn1Ref.current);
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    warn5Ref.current = null;
    warn1Ref.current = null;
    timeoutRef.current = null;

    const now = Date.now();
    lastActivityRef.current = now;

    // Schedule new timers from now
    if (USE_SHORT_TIMEOUT) {
      // Short policy warnings
      warn1Ref.current = window.setTimeout(() => {
        warn1ToastRef.current?.dismiss();
        const t = toast({
          title: <span className="text-[#aa2ee2]">Session timeout in 1 minute</span>,
          description: "Click here or anywhere to stay signed in.",
          duration: 14000,
          action: (
          <button
            onClick={() => {
              resetTimers();
              warn1ToastRef.current?.dismiss();
            }}
            className="inline-flex items-center justify-center rounded-md border bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary focus:outline-none focus:ring-1 focus:ring-ring"
          >
            Stay signed in
          </button>
          ),
        });
        warn1ToastRef.current = t as any;
      }, Math.max(0, WARN_1_MS_SHORT));
    } else {
      // Long policy warnings: 5-min and 1-min
      warn5Ref.current = window.setTimeout(() => {
        warn5ToastRef.current?.dismiss();
        const t = toast({
          title: <span className="text-[#aa2ee2]">Session timeout in 5 minutes</span>,
          description: "Click here or anywhere to stay signed in.",
          duration: 12000,
          action: (
            <button
              onClick={() => {
                resetTimers();
                warn5ToastRef.current?.dismiss();
              }}
              className="inline-flex items-center justify-center rounded-md border bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary focus:outline-none focus:ring-1 focus:ring-ring"
            >
              Stay signed in
            </button>
          ),
        });
        warn5ToastRef.current = t as any;
      }, Math.max(0, WARN_5_MS_LONG));

      warn1Ref.current = window.setTimeout(() => {
        warn1ToastRef.current?.dismiss();
        const t = toast({
          title: <span className="text-[#aa2ee2]">Session timeout in 1 minute</span>,
          description: "Click here or anywhere to stay signed in.",
          duration: 14000,
          action: (
            <button
              onClick={() => {
                resetTimers();
                warn1ToastRef.current?.dismiss();
              }}
              className="inline-flex h-8 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium transition-colors hover:bg-secondary focus:outline-none focus:ring-1 focus:ring-ring"
            >
              Stay signed in
            </button>
          ),
        });
        warn1ToastRef.current = t as any;
      }, Math.max(0, WARN_1_MS_LONG));
    }

    timeoutRef.current = window.setTimeout(async () => {
      warn5ToastRef.current?.dismiss();
      warn1ToastRef.current?.dismiss();
      try {
        await signOut();
      } finally {
        router.replace("/home");
      }
    }, Math.max(0, USE_SHORT_TIMEOUT ? TIMEOUT_MS_SHORT : TIMEOUT_MS_LONG));
  }, [router, signOut]);

  React.useEffect(() => {
    if (!isLoggedIn) {
      // Clear any timers when not logged in
      if (warn5Ref.current) window.clearTimeout(warn5Ref.current);
      if (warn1Ref.current) window.clearTimeout(warn1Ref.current);
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      warn5Ref.current = null;
      warn1Ref.current = null;
      timeoutRef.current = null;
      warn5ToastRef.current?.dismiss();
      warn1ToastRef.current?.dismiss();
      return;
    }

    // Set up listeners to capture activity
    const onAnyActivity = () => resetTimers();
    const winEvents: (keyof WindowEventMap)[] = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "click",
      "pointerdown",
    ];
    const docEvents: (keyof DocumentEventMap)[] = ["visibilitychange"];
    winEvents.forEach((e) => window.addEventListener(e, onAnyActivity, { passive: true }));
    docEvents.forEach((e) => document.addEventListener(e, onAnyActivity, { passive: true }));

    // Initialize timers for the first time
    resetTimers();

    return () => {
      winEvents.forEach((e) => window.removeEventListener(e, onAnyActivity));
      docEvents.forEach((e) => document.removeEventListener(e, onAnyActivity));
      if (warn5Ref.current) window.clearTimeout(warn5Ref.current);
      if (warn1Ref.current) window.clearTimeout(warn1Ref.current);
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      warn5ToastRef.current?.dismiss();
      warn1ToastRef.current?.dismiss();
      warn5Ref.current = null;
      warn1Ref.current = null;
      timeoutRef.current = null;
      warn5ToastRef.current = null;
      warn1ToastRef.current = null;
    };
  }, [isLoggedIn, resetTimers]);

  return null;
}
