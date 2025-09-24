"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function toTitleCase(input: string) {
  return input
    .split(/[-\s]/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function TitleSetter() {
  const pathname = usePathname();

  useEffect(() => {
    const base = "BrickAI";
    if (!pathname || pathname === "/") {
      document.title = base;
      return;
    }

    const [_, first] = pathname.split("/");
    const page = first ? toTitleCase(decodeURIComponent(first)) : "";
    document.title = page ? `${base} - ${page}` : base;
  }, [pathname]);

  return null;
}

