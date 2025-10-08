"use client";

import { useEffect, useMemo, useState } from "react";
import { useProfileCompletion } from "@/hooks/useProfileCompletion";
import CompleteProfileForm from "@/components/CompleteProfileForm";
import SmokyBG from "@/components/SmokyBG";
import { useAuth } from "@/hooks/useAuth";

export default function ProfileCompletionGate() {
  const { isLoggedIn, isLoading } = useAuth();
  const { status, loading, refresh } = useProfileCompletion();
  const [open, setOpen] = useState(false);

  const mustGate = useMemo(() => {
    if (!isLoggedIn) return false;
    if (isLoading || loading) return false;
    return !status.complete;
  }, [isLoggedIn, isLoading, loading, status.complete]);

  useEffect(() => {
    setOpen(mustGate);
  }, [mustGate]);

  if (!isLoggedIn || !open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] text-white overflow-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="complete-profile-title"
    >
      {/* Smoky background full-viewport */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <SmokyBG className="absolute inset-0" speed={1.6} blobs={5} minR={0.08} maxR={0.18} blurPx={40} opacity={0.28} centerAlpha={0.42} />
      </div>
      <div className="relative z-10 min-h-screen max-w-2xl mx-auto px-4 py-10 flex flex-col">
        <header className="mb-6">
          <h1 id="complete-profile-title" className="text-3xl font-bold">Finish setting up your account</h1>
          <p className="text-muted-foreground mt-1">Please confirm your details to continue to your hub.</p>
        </header>
        <main className="bg-card border rounded-md p-6 sm:p-8 shadow-md">
          <CompleteProfileForm
            onCompleted={async () => {
              await refresh();
              setOpen(false);
            }}
          />
        </main>
        <footer className="mt-6 text-center text-xs text-white/70">
          Your information is private and only used for billing and account verification.
        </footer>
      </div>
    </div>
  );
}
