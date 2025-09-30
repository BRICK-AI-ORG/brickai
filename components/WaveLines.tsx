"use client";

import React from "react";
import { cn } from "@/lib/utils";

type WaveLinesProps = {
  className?: string;
  colorA?: string; // start stroke color
  colorB?: string; // end stroke color
  strokeOpacity?: number;
  strokeWidth?: number;
  lines?: number;
};

// Animated, faint curved lines that subtly react to a moving
// center of gravity (CoG). CoG follows the mouse when hovered
// and meanders on its own otherwise. Lines maintain separation
// to avoid intersections.
export default function WaveLines({
  className,
  colorA = "#22d3ee",
  colorB = "#3b82f6",
  strokeOpacity = 0.3, // slightly brighter default
  strokeWidth = 0.6,
  lines = 14,
}: WaveLinesProps) {
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const svgRef = React.useRef<SVGSVGElement>(null);
  const pathRefs = React.useRef<(SVGPathElement | null)[]>([]);

  const sizeRef = React.useRef({ width: 0, height: 0 });
  const stateRef = React.useRef({
    t: 0,
    hovered: false,
    mouseX: 0.5,
    mouseY: 0.5,
    cogX: 0.5,
    cogY: 0.5,
  });
  const prevBoxRef = React.useRef<string>("0 0 1200 600");

  React.useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const ro = new ResizeObserver(() => {
      const r = wrap.getBoundingClientRect();
      sizeRef.current.width = Math.max(1, Math.floor(r.width));
      sizeRef.current.height = Math.max(1, Math.floor(r.height));
    });
    ro.observe(wrap);

    const onMove = (e: MouseEvent) => {
      const r = wrap.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const inside = x >= 0 && y >= 0 && x <= r.width && y <= r.height;
      stateRef.current.hovered = inside;
      if (inside) {
        stateRef.current.mouseX = r.width > 0 ? x / r.width : 0.5;
        stateRef.current.mouseY = r.height > 0 ? y / r.height : 0.5;
      }
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    let raf: number | null = null;
    let prev = performance.now();
    const step = (now: number) => {
      const dt = Math.min(64, now - prev) / 1000; // seconds
      prev = now;
      const st = stateRef.current;
      const sz = sizeRef.current;
      if (sz.width <= 0 || sz.height <= 0) {
        raf = requestAnimationFrame(step);
        return;
      }

      st.t += dt;

      // Autopilot path moves slowly in a lissajous pattern
      const autoX = 0.5 + 0.22 * Math.sin(st.t * 0.15);
      const autoY = 0.5 + 0.18 * Math.cos(st.t * 0.12 + 0.6);

      // When hovered, bias CoG target toward the mouse
      const targetX = st.hovered ? st.mouseX * 0.75 + autoX * 0.25 : autoX;
      const targetY = st.hovered ? st.mouseY * 0.75 + autoY * 0.25 : autoY;

      // Ease CoG toward target
      st.cogX += (targetX - st.cogX) * 0.06;
      st.cogY += (targetY - st.cogY) * 0.06;

      const width = sz.width;
      const height = sz.height;
      const box = `0 0 ${width} ${height}`;
      if (svgRef.current && prevBoxRef.current !== box) {
        svgRef.current.setAttribute("viewBox", box);
        prevBoxRef.current = box;
      }
      const margin = Math.max(16, Math.min(40, Math.floor(height * 0.06)));
      const minSep = Math.max(6, Math.min(16, Math.floor(height * 0.02)));
      const samples = Math.max(48, Math.min(200, Math.floor(width / 12))); // denser sampling for smoother curves

      const cogPxX = st.cogX * width;
      const cogPxY = st.cogY * height;

      // Pre-allocate point arrays per line
      const pts: { x: number; y: number }[][] = Array.from({ length: lines }, () => []);
      const ysCol: number[] = new Array(lines);

      // Precompute per-line phase/amplitude variants
      const lineAmpBase = 10 + 3 * Math.sin(st.t * 0.35); // slightly reduced amplitude for smoother look
      const lineAmp: number[] = Array.from({ length: lines }, (_, i) =>
        lineAmpBase * (0.85 + 0.25 * Math.sin(i * 0.9 + st.t * 0.25))
      );

      // Build columns of y-values across x samples
      for (let j = 0; j < samples; j++) {
        const xn = j / (samples - 1);
        const x = xn * width;

        // Two superimposed sine fields for "more fluctuating" curves (slightly lower frequencies)
        const freq1 = 2.2; // moderate spatial frequency
        const freq2 = 3.4; // secondary harmonic, lighter weight
        const sinPhase1 = st.t * 0.7 + xn * Math.PI * 2 * freq1;
        const sinPhase2 = -st.t * 0.45 + xn * Math.PI * 2 * freq2;

        // Local influence from CoG (stronger near cx)
        const dx = (x - cogPxX) / width;
        const gauss = Math.exp(-(dx * dx) / 0.06); // wider bell for smoother influence

        // Iterate lines top -> bottom and ensure separation
        let prevY = margin - minSep;
        for (let i = 0; i < lines; i++) {
          const tLine = i / (lines - 1);
          const baseY = margin + tLine * (height - 2 * margin);

          // Sinusoidal curvature + local CoG push/pull
          const amp = lineAmp[i];
          const sinMix = Math.sin(sinPhase1 + i * 0.28) * amp + Math.sin(sinPhase2 + i * 0.16) * amp * 0.2;

          // Push lines away from CoG vertically; lines above go a bit up, below a bit down
          const signFromCog = (baseY - cogPxY) / Math.max(1, height);
          const gravBend = gauss * (8 + 3 * Math.sin(st.t * 0.55 + i * 0.35)) * signFromCog;

          let y = baseY + sinMix + gravBend;

          // Hard bounds to keep room for lines below to separate
          const maxForRemaining = height - margin - (lines - 1 - i) * minSep;
          if (y > maxForRemaining) y = maxForRemaining;

          // Enforce non-intersection: monotonically increasing with a min separation
          if (y < prevY + minSep) y = prevY + minSep;
          prevY = y;

          ysCol[i] = y;
        }

        // If bottom line overflows, shift entire column up
        const overflow = ysCol[lines - 1] - (height - margin);
        if (overflow > 0) {
          for (let i = 0; i < lines; i++) ysCol[i] -= overflow;
        }

        for (let i = 0; i < lines; i++) {
          pts[i].push({ x, y: ysCol[i] });
        }
      }

      // Convert sampled points into smooth cubic paths (Catmull–Rom)
      for (let i = 0; i < lines; i++) {
        const p = pts[i];
        if (p.length < 2) continue;
        // Smooth along x with a small moving-average filter (extra pass)
        for (let pass = 0; pass < 3; pass++) {
          for (let k = 1; k < p.length - 1; k++) {
            const ySm = (p[k - 1].y + 4 * p[k].y + p[k + 1].y) / 6;
            p[k].y = ySm;
          }
        }
        // Re‑enforce separation after smoothing
        if (i > 0) {
          const prevLine = pts[i - 1];
          for (let k = 0; k < p.length; k++) {
            const minY = prevLine[k].y + minSep;
            if (p[k].y < minY) p[k].y = minY;
          }
        }
        // Catmull-Rom to cubic Bezier with slight tension to soften curvature
        const seg = (a: { x: number; y: number }, b: { x: number; y: number }, c: { x: number; y: number }, d: { x: number; y: number }) => {
          const tension = 0.8; // 1 = Catmull-Rom; <1 reduces curvature
          const c1x = b.x + ((c.x - a.x) / 6) * tension;
          const c1y = b.y + ((c.y - a.y) / 6) * tension;
          const c2x = c.x - ((d.x - b.x) / 6) * tension;
          const c2y = c.y - ((d.y - b.y) / 6) * tension;
          return `C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${c.x.toFixed(2)} ${c.y.toFixed(2)}`;
        };
        let d = `M ${p[0].x.toFixed(2)} ${p[0].y.toFixed(2)}`;
        for (let k = 0; k < p.length - 1; k++) {
          const a = p[k - 1] ?? p[k];
          const b = p[k];
          const c = p[k + 1];
          const dpt = p[k + 2] ?? c;
          d += ` ${seg(a, b, c, dpt)}`;
        }
        const el = pathRefs.current[i];
        if (el) el.setAttribute("d", d);
      }

      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      ro.disconnect();
    };
  }, [lines]);

  // Prepare path refs
  const pathList = React.useMemo(() => Array.from({ length: lines }), [lines]);

  // Unique gradient id (simple scoped id to avoid conflicts)
  const gradientId = React.useId();

  return (
    <div
      ref={wrapRef}
      className={cn(
        "absolute inset-0 z-10 pointer-events-none mix-blend-screen transition-opacity",
        className
      )}
      aria-hidden
    >
      <svg ref={svgRef} className="h-full w-full" viewBox="0 0 1200 600" preserveAspectRatio="none" shapeRendering="geometricPrecision">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colorA} />
            <stop offset="100%" stopColor={colorB} />
          </linearGradient>
        </defs>
        {pathList.map((_, idx) => (
          <path
            key={idx}
            ref={(el: SVGPathElement | null) => { pathRefs.current[idx] = el; }}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeOpacity={Math.max(0.12, Math.min(0.42, strokeOpacity * (0.92 + (Math.sin(idx * 1.07) + 1) * 0.06)))}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />)
        )}
      </svg>
    </div>
  );
}
