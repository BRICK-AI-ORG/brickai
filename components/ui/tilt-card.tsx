"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type TiltCardProps = {
  className?: string;
  intensity?: number; // rotation degrees scale
  glareOpacity?: number; // 0..1 for glow strength
  children: React.ReactNode;
};

export function TiltCard({
  className,
  intensity = 4,
  glareOpacity = 0.12,
  children,
}: TiltCardProps) {
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const innerRef = React.useRef<HTMLDivElement>(null);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const inner = innerRef.current;
    const wrap = wrapRef.current;
    if (!inner || !wrap) return;

    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const rect = wrap.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const px = x / rect.width;
    const py = y / rect.height;

    const rx = (0.5 - py) * intensity * 2; // rotateX: move down -> tilt backward
    const ry = (px - 0.5) * intensity * 2; // rotateY: move right -> tilt right

    inner.style.transform = `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
    inner.style.setProperty("--mouse-x", `${x}px`);
    inner.style.setProperty("--mouse-y", `${y}px`);
  };

  const handleLeave = () => {
    const inner = innerRef.current;
    if (!inner) return;
    inner.style.transform = "rotateX(0deg) rotateY(0deg)";
  };

  return (
    <div
      ref={wrapRef}
      className={cn("group [perspective:1000px]", className)}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      <div
        ref={innerRef}
        className={cn(
          "relative rounded-xl transition-transform duration-200 ease-out will-change-transform",
          "[transform-style:preserve-3d]"
        )}
        style={{ transform: "rotateX(0deg) rotateY(0deg)" }}
      >
        {children}
        {/* Lighting overlay */}
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 opacity-0",
            "transition-opacity duration-200 group-hover:opacity-100"
          )}
          style={{
            background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(255,255,255,${glareOpacity}), transparent 50%)`,
            mixBlendMode: "soft-light",
            borderRadius: "inherit",
          }}
        />
      </div>
    </div>
  );
}

export default TiltCard;
