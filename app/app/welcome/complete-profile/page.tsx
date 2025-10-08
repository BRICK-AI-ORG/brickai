"use client";

import CompleteProfileForm from "@/components/CompleteProfileForm";
import SmokyBG from "@/components/SmokyBG";
import { useProfileCompletion } from "@/hooks/useProfileCompletion";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CompleteProfilePage() {
  const { status, loading, refresh } = useProfileCompletion();
  const router = useRouter();

  useEffect(() => {
    if (!loading && status.complete) {
      router.replace("/app/hub");
    }
  }, [loading, status.complete, router]);

  return (
    <div className="fixed inset-0 z-[100] text-white overflow-auto">
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <SmokyBG className="absolute inset-0" speed={1.6} blobs={5} minR={0.08} maxR={0.18} blurPx={40} opacity={0.28} centerAlpha={0.42} />
      </div>
      <div className="relative z-10 min-h-screen max-w-2xl mx-auto px-4 py-10 flex flex-col">
        <header className="mb-6">
          <h1 className="text-3xl font-bold">Finish setting up your account</h1>
          <p className="text-muted-foreground mt-1">Please confirm your details to continue to your hub.</p>
        </header>
        <main className="bg-card border rounded-md p-6 sm:p-8 shadow-md">
          <CompleteProfileForm
            onCompleted={async () => {
              if (typeof window !== "undefined") {
                try { sessionStorage.setItem("profileCompleted", "1"); } catch {}
              }
              await refresh();
              router.replace("/app/hub");
            }}
          />
        </main>
        <footer className="mt-6 text-center text-xs text-white/70">
          Your information is private and only used for billing and account verification.
        </footer>
      </div>
      {/* Hide Hubbar on onboarding pages */}
      <style jsx global>{`
        aside[aria-label="Hubbar"] { display: none !important; }
        button[aria-label$="hubbar"] { display: none !important; }
      `}</style>
    </div>
  );
}
