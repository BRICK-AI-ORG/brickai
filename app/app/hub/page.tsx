"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePortfolioManager } from "@/hooks/usePortfolioManager";
import { PortfolioCard } from "@/components/PortfolioCard";
import { CreatePortfolioForm } from "@/components/CreatePortfolioForm";
import { Button } from "@/components/ui/button";
import { PlusCircle, ClipboardList } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import FunLoader from "@/components/FunLoader";

export default function HubPage() {
  const { user, session } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { items, loading, createTask, deleteTask, toggleTaskComplete, createPortfolio, updatePortfolio, deletePortfolioWithPassword, deletePortfolio } =
    usePortfolioManager();

  // If a Google user initiated a delete and then confirmed via email link,
  // complete the deletion automatically on return to the hub.
  useEffect(() => {
    if (loading) return;
    if (typeof window === "undefined") return;
    const pendingId = window.localStorage.getItem("brickai.pendingDeletePortfolio");
    const pendingAt = window.localStorage.getItem("brickai.pendingDeleteSetAt");
    if (!pendingId || !pendingAt) return;

    const lastSignInAt = session?.user?.last_sign_in_at;
    if (!lastSignInAt) return; // no recent sign-in detected

    const last = new Date(lastSignInAt).getTime();
    const setAt = new Date(pendingAt).getTime();
    // Require a fresh sign-in strictly after the request time (with small skew)
    if (!(last > setAt + 1000)) return;

    (async () => {
      try {
        await deletePortfolio(pendingId);
      } catch (err) {
        console.error("Auto-deletion failed:", err);
      } finally {
        try {
          window.localStorage.removeItem("brickai.pendingDeletePortfolio");
          window.localStorage.removeItem("brickai.pendingDeleteSetAt");
        } catch {}
      }
    })();
  }, [loading, session?.user?.last_sign_in_at, deletePortfolio]);

  const handleCreatePortfolio = async (name: string, description: string | null) => {
    await createPortfolio(name, description ?? undefined);
    setIsDialogOpen(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-bold">Your Hub</h1>
          <p className="text-muted-foreground">
            {user?.name ? `Welcome, ${user.name}.` : "Welcome back."}
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Portfolio
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Portfolio</DialogTitle>
              <DialogDescription>
                Name your portfolio and optionally add a description.
              </DialogDescription>
            </DialogHeader>
            <CreatePortfolioForm onSubmit={handleCreatePortfolio} />
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <FunLoader />
      ) : items.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map(({ portfolio, tasks }) => (
            <PortfolioCard
              key={portfolio.portfolio_id}
              portfolio={portfolio}
              tasks={tasks}
              onCreateTask={async (pid, title, description) => {
                await createTask(pid, title, description);
              }}
              onDeleteTask={async (taskId) => deleteTask(taskId)}
              onToggleComplete={async (taskId, completed) =>
                toggleTaskComplete(taskId, completed)
              }
              onEditPortfolio={updatePortfolio}
              onDeletePortfolio={async (id, password) => deletePortfolioWithPassword(id, password)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-card border rounded-md p-8 text-center">
          <ClipboardList className="mx-auto h-8 w-8 text-gray-400 mb-4" />
          <p className="text-gray-500">Create a portfolio to get started.</p>
        </div>
      )}
    </div>
  );
}
