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
import { PlusCircle, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import TaskEditor from "@/components/TaskEditor";

interface PortfolioCardProps {
  portfolio: Portfolio;
  tasks: Task[];
  onCreateTask: (
    portfolioId: string,
    title: string,
    description: string,
    options?: { dueDate?: string | null; imageFile?: File | null }
  ) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
  onToggleComplete: (taskId: string, completed: boolean) => Promise<void>;
  onEditPortfolio?: (
    id: string,
    updates: { name?: string; description?: string | null }
  ) => Promise<void>;
  onDeletePortfolio?: (id: string, password: string) => Promise<void>;
}

export function PortfolioCard({
  portfolio,
  tasks,
  onCreateTask,
  onDeleteTask,
  onToggleComplete,
  onEditPortfolio,
  onDeletePortfolio,
}: PortfolioCardProps) {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [name, setName] = useState(portfolio.name);
  const [description, setDescription] = useState(portfolio.description ?? "");
  const [pwd, setPwd] = useState("");
  const [deleting, setDeleting] = useState(false);

  const handleCreate = async (
    title: string,
    description: string,
    dueDate?: string | null,
    imageFile?: File | null
  ) => {
    await onCreateTask(portfolio.portfolio_id, title, description, {
      dueDate: dueDate ?? null,
      imageFile: imageFile ?? null,
    });
    setOpen(false);
  };

  return (
    <div className="bg-card border rounded-md p-6 sm:p-8 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-2xl font-semibold truncate">{portfolio.name}</h2>
          {portfolio.description && (
            <p className="mt-1 text-sm text-muted-foreground break-words">{portfolio.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {onEditPortfolio && (
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Pencil className="mr-2 h-4 w-4" /> Edit
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Portfolio</DialogTitle>
                  <DialogDescription>Update the name and description.</DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="pname">Name</Label>
                    <Input id="pname" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="pdesc">Description</Label>
                    <Textarea id="pdesc" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      onClick={async () => {
                        await onEditPortfolio!(portfolio.portfolio_id, {
                          name: name.trim(),
                          description: description.trim() || null,
                        });
                        setEditOpen(false);
                      }}
                    >
                      Save
                    </Button>
                  </div>
                </div>
                {/* Danger zone moved here from Add Task dialog */}
                <div className="pt-4 mt-4 border-t">
                  <div className="text-sm font-semibold mb-2">Danger zone</div>
                  <div className="space-y-2">
                    <Label htmlFor="pdel">Confirm your password to delete this portfolio</Label>
                    <Input
                      id="pdel"
                      type="password"
                      value={pwd}
                      onChange={(e) => setPwd(e.target.value)}
                      placeholder="Your account password"
                    />
                    <Button
                      variant="destructive"
                      disabled={!pwd || deleting || !onDeletePortfolio}
                      onClick={async () => {
                        if (!onDeletePortfolio) return;
                        setDeleting(true);
                        try {
                          await onDeletePortfolio(portfolio.portfolio_id, pwd);
                          setEditOpen(false);
                        } finally {
                          setDeleting(false);
                          setPwd("");
                        }
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Delete Portfolio
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
      {/* Add Task button on its own line, smaller */}
      <div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="mt-1">
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
          onEdit={(taskId) => setEditingTaskId(taskId)}
        />
      </div>
      <Dialog open={!!editingTaskId} onOpenChange={(o) => !o && setEditingTaskId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>Update task details and attachments.</DialogDescription>
          </DialogHeader>
          {editingTaskId && (
            <TaskEditor taskId={editingTaskId} onClose={() => setEditingTaskId(null)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
