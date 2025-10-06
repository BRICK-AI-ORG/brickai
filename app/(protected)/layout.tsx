"use client";

import { RouteGuard } from "@/components/RouteGuard";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Root layout already provides html/body, header/footer, and containers.
  // Keep this layout minimal and only enforce the guard.
  return <RouteGuard>{children}</RouteGuard>;
}
