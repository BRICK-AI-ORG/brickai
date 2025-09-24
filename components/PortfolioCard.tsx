import { Portfolio, Task } from "@/types/models";
import TaskList from "@/components/TaskList";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CreateTaskForm } from "@/components/CreateTaskForm";
import { PlusCircle } from "lucide-react";
import { useState } from "react";

interface PortfolioCardProps {
  portfolio: Portfolio;
  tasks: Task[];
  onCreateTask: (portfolioId: string, title: string, description: string) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
  onToggleComplete: (taskId: string, completed: boolean) => Promise<void>;
}

export function PortfolioCard({
  portfolio,
  tasks,
  onCreateTask,
  onDeleteTask,
  onToggleComplete,
}: PortfolioCardProps) {
  const [open, setOpen] = useState(false);

  const handleCreate = async (title: string, description: string) => {
    await onCreateTask(portfolio.portfolio_id, title, description);
    setOpen(false);
  };

  return (
    <div className="bg-card border rounded-md p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{portfolio.name}</h2>
          {portfolio.description && (
            <p className="text-sm text-muted-foreground">{portfolio.description}</p>
          )}
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Task in {portfolio.name}</DialogTitle>
              <DialogDescription>Enter the details for your new task.</DialogDescription>
            </DialogHeader>
            <CreateTaskForm onSubmit={handleCreate} />
          </DialogContent>
        </Dialog>
      </div>
      <div className="bg-card border rounded-md">
        <TaskList
          tasks={tasks}
          onDelete={onDeleteTask}
          onToggleComplete={onToggleComplete}
        />
      </div>
    </div>
  );
}
