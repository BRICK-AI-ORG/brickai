"use client";

import * as React from "react";

type Props = {
  targetClass?: string;
};

export default function EqualizeHeights({ targetClass = "solutions-card" }: Props) {
  React.useEffect(() => {
    const nodes = Array.from(document.getElementsByClassName(targetClass)) as HTMLElement[];
    if (!nodes.length) return;

    let raf = 0;
    const apply = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        // reset heights to measure accurately
        nodes.forEach((n) => (n.style.height = "auto"));
        const max = nodes.reduce((m, n) => Math.max(m, n.offsetHeight), 0);
        nodes.forEach((n) => (n.style.height = `${max}px`));
      });
    };

    apply();

    const ro = new ResizeObserver(() => apply());
    nodes.forEach((n) => ro.observe(n));

    const onResize = () => apply();
    window.addEventListener("resize", onResize);

    // Re-apply after fonts load (text reflow). Optional chaining handles browsers without Font Loading API.
    document.fonts?.ready?.then(apply).catch(() => {});

    return () => {
      window.removeEventListener("resize", onResize);
      ro.disconnect();
      cancelAnimationFrame(raf);
      nodes.forEach((n) => (n.style.height = ""));
    };
  }, [targetClass]);

  return null;
}
