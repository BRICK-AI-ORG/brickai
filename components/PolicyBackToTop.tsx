"use client";

import { useCallback } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PolicyBackToTopProps = {
  targetId: string;
  className?: string;
};

export function PolicyBackToTop({ targetId, className }: PolicyBackToTopProps) {
  const handleClick = useCallback(() => {
    const target = document.getElementById(targetId);
    if (target) {
      if (typeof target.scrollTo === "function") {
        target.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        // Fallback for older browsers
        target.scrollTop = 0;
      }
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [targetId]);

  return (
    <Button
      type="button"
      variant="secondary"
      onClick={handleClick}
      className={cn("gap-2 bg-[#171717] text-white hover:bg-[#202020] border border-white/10", className)}
    >
      <ArrowUp className="h-4 w-4" />
      Back to top
    </Button>
  );
}

export default PolicyBackToTop;
