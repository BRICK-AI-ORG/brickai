import { RouteGuard } from "@/components/RouteGuard";
import { Hubbar } from "@/components/AppSidebar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard>
      <div className="min-h-screen flex flex-col md:flex-row gap-3 md:gap-4">
        <Hubbar />
        <div className="flex-1 min-w-0 pt-10 pb-4 sm:pb-6 px-3 md:px-4" style={{ contentVisibility: "auto" }}>
          {children}
        </div>
      </div>
    </RouteGuard>
  );
}
