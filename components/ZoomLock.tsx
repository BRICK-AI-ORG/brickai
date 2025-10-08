"use client";

import { useEffect } from "react";

// Prevents browser zooming via Ctrl/Cmd + scroll and common key combos.
// Note: Users can still zoom via browser UI menus, which cannot be reliably blocked.
export default function ZoomLock() {
  useEffect(() => {
    const coarsePointer = window.matchMedia?.("(pointer: coarse)").matches ?? false;
    if (coarsePointer) {
      // Skip on touch devices for smoother scrolling and less overhead
      return;
    }
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        const key = e.key.toLowerCase();
        if (key === "+" || key === "-" || key === "=" || key === "_" || key === "add" || key === "subtract" || key === "0") {
          e.preventDefault();
        }
      }
    };
    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("wheel", handleWheel as EventListener);
      window.removeEventListener("keydown", handleKeyDown as EventListener);
    };
  }, []);

  return null;
}
