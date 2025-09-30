"use client";

import React from "react";

type SmokyBGProps = {
  className?: string;
  colors?: string[]; // gradient core colors
  blobs?: number; // number of moving blobs
  speed?: number; // 1 = normal, >1 faster
  blurPx?: number; // css blur amount
  opacity?: number; // overall opacity
  minR?: number; // min radius (relative to min(w,h))
  maxR?: number; // max radius (relative to min(w,h))
  centerAlpha?: number; // 0..1 center alpha of blobs
};

type Blob = {
  bx: number; // base x (0..1)
  by: number; // base y (0..1)
  ax: number; // amplitude x (0..0.4)
  ay: number; // amplitude y (0..0.4)
  fx: number; // frequency x (rad/s)
  fy: number; // frequency y (rad/s)
  phx: number; // phase x
  phy: number; // phase y
  r: number; // radius in px (relative, scaled by min(w,h))
  color: string;
};

export default function SmokyBG({
  className,
  colors = ["#aa2ee2", "#22d3ee"],
  blobs = 7,
  speed = 1.25,
  blurPx = 36,
  opacity = 0.28,
  minR = 0.18,
  maxR = 0.34,
  centerAlpha = 0.67,
}: SmokyBGProps) {
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const raf = React.useRef<number | null>(null);
  const t0 = React.useRef<number>(0);
  const list = React.useRef<Blob[]>([]);

  React.useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let width = 0;
    let height = 0;
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

    const rand = (a: number, b: number) => Math.random() * (b - a) + a;
    const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

    const seedBlobs = () => {
      list.current = Array.from({ length: blobs }).map(() => {
        const ax = rand(0.12, 0.26); // wider horizontal travel
        const ay = rand(0.08, 0.22); // wider vertical travel
        return {
          bx: rand(-0.1, 1.1), // allow off-canvas start to cover edges
          by: rand(-0.05, 1.05),
          ax,
          ay,
          fx: rand(0.15, 0.36),
          fy: rand(0.12, 0.32),
          phx: rand(0, Math.PI * 2),
          phy: rand(0, Math.PI * 2),
          r: rand(minR, maxR), // relative to min(w,h)
          color: pick(colors),
        } as Blob;
      });
    };

    const resize = () => {
      const r = wrap.getBoundingClientRect();
      width = Math.max(1, Math.floor(r.width));
      height = Math.max(1, Math.floor(r.height));
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    seedBlobs();
    resize();
    const ro = new ResizeObserver(() => {
      resize();
    });
    ro.observe(wrap);

    const hexToRGBA = (hex: string, a: number) => {
      const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      if (!m) return hex;
      const r = parseInt(m[1], 16);
      const g = parseInt(m[2], 16);
      const b = parseInt(m[3], 16);
      return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, a))})`;
    };

    const step = (now: number) => {
      if (!t0.current) t0.current = now;
      const t = (now - t0.current) / 1000; // seconds

      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";

      const minDim = Math.min(width, height);
      for (const b of list.current) {
        const x = (b.bx + Math.cos(b.phx + t * b.fx * speed) * b.ax) * width;
        const y = (b.by + Math.sin(b.phy + t * b.fy * speed) * b.ay) * height;
        const rad = b.r * minDim;
        const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
        const c = b.color;
        g.addColorStop(0, hexToRGBA(c, centerAlpha)); // near center
        g.addColorStop(1, hexToRGBA(c, 0)); // fade out
        ctx.fillStyle = g as any;
        ctx.beginPath();
        ctx.arc(x, y, rad, 0, Math.PI * 2);
        ctx.fill();
      }

      raf.current = requestAnimationFrame(step);
    };

    raf.current = requestAnimationFrame(step);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      ro.disconnect();
    };
  }, [blobs, colors, speed, minR, maxR, centerAlpha]);

  return (
    <div ref={wrapRef} className={"pointer-events-none " + (className ?? "")}> 
      <canvas
        ref={canvasRef}
        className="w-full h-full mix-blend-screen"
        style={{ filter: `blur(${blurPx}px) brightness(1.05)`, opacity }}
        aria-hidden
      />
    </div>
  );
}
