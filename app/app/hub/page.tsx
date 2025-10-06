"use client";

import React, { useState } from "react";
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

export default function HubPage() {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { items, loading, createTask, deleteTask, toggleTaskComplete, createPortfolio, updatePortfolio, deletePortfolioWithPassword } =
    usePortfolioManager();

  const handleCreatePortfolio = async (name: string, description: string | null) => {
    await createPortfolio(name, description ?? undefined);
    setIsDialogOpen(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
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
        <div>Loading...</div>
      ) : items.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
