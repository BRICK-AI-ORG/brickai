"use client";

import React from "react";

export default function FunLoader() {
  const [showCircles, setShowCircles] = React.useState(false);
  const [showText, setShowText] = React.useState(false);
  React.useEffect(() => {
    const t = setTimeout(() => setShowCircles(true), 2000);
    const tx = setTimeout(() => setShowText(true), 500);
    return () => {
      clearTimeout(t);
      clearTimeout(tx);
    };
  }, []);

  return (
    <div className="relative grid place-items-center py-16 min-h-[50vh]" aria-live="polite">
      {/* Animated conic ring and orbs (after delay) */}
      {showCircles && (
        <div className="relative w-44 h-44 sm:w-52 sm:h-52">
          <div
            className="absolute inset-0 rounded-full opacity-60 animate-[spin_3.2s_linear_infinite]"
            style={{
              background:
                "conic-gradient(from 0deg, rgba(170,46,226,0.35), rgba(34,211,238,0.35), rgba(170,46,226,0.35))",
              WebkitMask: "radial-gradient(circle at center, transparent 58%, black 59%)",
              mask: "radial-gradient(circle at center, transparent 58%, black 59%)",
              filter: "blur(2px)",
              mixBlendMode: "screen",
            }}
          />
          {/* Soft glare */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(110px 110px at 32% 26%, rgba(255,255,255,0.20), transparent 65%)",
              filter: "blur(10px)",
              mixBlendMode: "screen",
            }}
          />
          {/* Orbiting orbs */}
          {[0, 1, 2].map((i) => (
            <div key={i} className="absolute inset-0" style={{ animation: `spin ${7 + i * 2}s linear infinite` }}>
              <div
                className="absolute left-1/2 top-0 -translate-x-1/2 w-3 h-3 rounded-full"
                style={{
                  background: i % 2 === 0 ? "#aa2ee2" : "#22d3ee",
                  opacity: 0.6,
                  boxShadow:
                    i % 2 === 0
                      ? "0 0 10px rgba(170,46,226,0.35), 0 0 16px rgba(170,46,226,0.25)"
                      : "0 0 10px rgba(34,211,238,0.35), 0 0 16px rgba(34,211,238,0.25)",
                }}
              />
            </div>
          ))}
        </div>
      )}
      {/* Text shimmer (delayed 0.5s) */}
      {showText && (
        <div className="mt-8 text-center">
          <div
            className="text-xl sm:text-2xl font-extrabold tracking-tight bg-clip-text text-transparent select-none"
            style={{
              backgroundImage:
                "linear-gradient(90deg, rgba(170,46,226,0.25), rgba(34,211,238,0.6), rgba(170,46,226,0.25))",
              backgroundSize: "200% 100%",
              animation: "shimmer 2.6s ease-in-out infinite",
            }}
          >
            Building your BrickAI hub…
          </div>
          <div className="mt-2 text-xs sm:text-sm text-white/70">
            Unlocking portfolios, prepping tasks, warming up GPUs
          </div>
        </div>
      )}
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
