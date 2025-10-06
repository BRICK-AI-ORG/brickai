"use client";

import { RouteGuard } from "@/components/RouteGuard";
import AppSidebar from "@/components/AppSidebar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard>
      <div className="flex gap-3 md:gap-4">
        <AppSidebar />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </RouteGuard>
  );
}
