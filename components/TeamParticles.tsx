"use client";

import React from "react";

type TeamParticlesProps = {
  className?: string;
  scheme?: "cyan" | "orange" | "violet";
  density?: number; // 0.1 (very low) .. 1 (normal) .. 2 (high)
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  hue: number; // 185-200 (cyan/blue)
  sat: number; // 70-95
  alpha: number; // 0.2-0.6
  curveAmp: number;
  curveFreq: number;
  curvePhase: number;
  downer: boolean; // a few float downward
};

export default function TeamParticles({ className, scheme = "cyan", density = 1 }: TeamParticlesProps) {
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const rafRef = React.useRef<number | null>(null);
  const particlesRef = React.useRef<Particle[]>([]);
  const tRef = React.useRef(0);

  React.useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let width = 0;
    let height = 0;
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const rand = (min: number, max: number) => Math.random() * (max - min) + min;

    const spawn = (edge?: "bottom" | "left" | "right" | "top") => {
      // Spawn weighted towards bottom and sides
      const bias = edge ?? (Math.random() < 0.65 ? "bottom" : Math.random() < 0.5 ? "left" : "right");
      let x = rand(0, width);
      let y = rand(0, height);
      if (bias === "bottom") {
        x = rand(-10, width + 10);
        y = height + rand(0, 16);
      } else if (bias === "left") {
        x = -rand(0, 16);
        y = rand(0, height);
      } else if (bias === "right") {
        x = width + rand(0, 16);
        y = rand(0, height);
      } else if (bias === "top") {
        x = rand(0, width);
        y = -rand(0, 12);
      }

      const baseUp = -rand(30, 90) / 60; // px/frame upward speed (~-0.5 to -1.5)
      const baseSide = rand(-20, 20) / 60; // lateral drift
      const downer = Math.random() < 0.12; // a few float down

      let hueMin: number;
      let hueMax: number;
      if (scheme === "orange") {
        hueMin = 20; hueMax = 40;
      } else if (scheme === "violet") {
        hueMin = 270; hueMax = 300; // violet/purple range to match #aa2ee2
      } else {
        hueMin = 185; hueMax = 205; // cyan/blue
      }
      const p: Particle = {
        x,
        y,
        vx: baseSide,
        vy: downer ? Math.abs(baseUp) * 0.6 : baseUp,
        r: rand(1.5, 2.8), // slightly smaller
        hue: rand(hueMin, hueMax),
        sat: rand(70, 95),
        alpha: rand(0.25, 0.55),
        curveAmp: rand(0.2, 1.1),
        curveFreq: rand(0.5, 1.6),
        curvePhase: rand(0, Math.PI * 2),
        downer,
      };
      particlesRef.current.push(p);
    };

    const densityClamped = Math.max(0.1, Math.min(2, density));
    const desiredCount = () => {
      const base = Math.min(420, Math.max(140, Math.floor((width * height) / 2600)));
      // Scale by density; allow very low minimum when density is low
      return Math.max(16, Math.floor(base * densityClamped));
    };

    // Seed
    for (let i = 0; i < desiredCount(); i++) spawn();

    let prev = performance.now();
    const step = (now: number) => {
      const dt = Math.min(64, now - prev) / 16.6667; // ~frames
      prev = now;
      tRef.current += dt * 0.016; // seconds-ish

      // Maintain target count
      const target = desiredCount();
      if (particlesRef.current.length < target) {
        const deficit = target - particlesRef.current.length;
        for (let i = 0; i < deficit; i++) spawn();
      }

      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";

      const arr = particlesRef.current;
      for (let i = arr.length - 1; i >= 0; i--) {
        const p = arr[i];

        // Curved, random walk with upward bias
        const wind = Math.sin((tRef.current + p.curvePhase) * p.curveFreq) * p.curveAmp;
        p.vx += wind * 0.02 * dt + (Math.random() - 0.5) * 0.02 * dt;
        p.vx = Math.max(-1.8, Math.min(1.8, p.vx));

        const upBias = p.downer ? 0.001 : -0.004; // general upward pull
        p.vy += upBias * dt + (Math.random() - 0.5) * 0.01 * dt;
        p.vy = Math.max(-2.2, Math.min(1.6, p.vy));

        p.x += p.vx * (dt * 1.2 + 0.8);
        p.y += p.vy * (dt * 1.2 + 0.8);

        // Cull off-card with small margin; a few bounce back from top
        const margin = 8;
        if (p.y < -margin) {
          if (!p.downer && Math.random() < 0.1) {
            // convert a few to float back down
            p.downer = true;
            p.vy = Math.abs(p.vy) * 0.6 + 0.2;
          } else {
            arr.splice(i, 1);
            continue;
          }
        } else if (p.y > height + margin || p.x < -margin || p.x > width + margin) {
          arr.splice(i, 1);
          continue;
        }

        // Draw
        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3);
        const color = `hsla(${p.hue}, ${p.sat}%, 60%,`;
        grd.addColorStop(0, `${color} ${Math.min(0.8, p.alpha + 0.1)})`);
        grd.addColorStop(1, `${color} 0)`);
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [density]);

  return (
    <div
      ref={wrapRef}
      className={`absolute inset-0 z-10 pointer-events-none mix-blend-screen transition-all ${className ?? ""}`}
    >
      <canvas ref={canvasRef} className="w-full h-full filter brightness-100 group-hover:brightness-150" />
    </div>
  );
}
