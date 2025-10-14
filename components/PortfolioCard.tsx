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
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import TaskEditor from "@/components/TaskEditor";
import { createBrowserClient } from "@supabase/ssr";

interface PortfolioCardProps {
  portfolio: Portfolio;
  tasks: Task[];
  onCreateTask: (
    portfolioId: string,
    title: string,
    description: string,
    options?: { dueDate?: string | null; imageFiles?: File[] | null; priority?: string | null }
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
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [emailNotice, setEmailNotice] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [authProvider, setAuthProvider] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (!mounted) return;
        const provider = (data?.user?.app_metadata as any)?.provider ?? null;
        setAuthProvider(provider);
        setUserEmail(data?.user?.email ?? null);
      } catch {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async (
    title: string,
    description: string,
    dueDate?: string | null,
    imageFiles?: File[] | null,
    priority?: string | null
  ) => {
    await onCreateTask(portfolio.portfolio_id, title, description, {
      dueDate: dueDate ?? null,
      imageFiles: imageFiles ?? null,
      priority: priority ?? null,
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
            <DialogContent className="w-[95vw] sm:max-w-[720px] md:max-w-[864px] lg:max-w-[960px] max-h-[85vh] overflow-y-auto scrollbar-purple">
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
                    <Textarea
                      id="pdesc"
                      value={description}
                      onChange={(e) => setDescription(e.target.value.slice(0, 2000))}
                      rows={4}
                      maxLength={2000}
                    />
                    <div className="text-xs text-muted-foreground mt-1 text-right">{description.length}/2000</div>
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
                    {authProvider === "google" ? (
                      <>
                        <Label>Verify via email to delete this portfolio</Label>
                        <p className="text-sm text-muted-foreground">
                          This account uses Google sign-in. Send a verification link to {userEmail || "your email"} and follow it, then return here.
                        </p>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="destructive"
                            disabled={sendingEmail || !userEmail}
                            onClick={async () => {
                              setEmailNotice(null);
                              setEmailError(null);
                              setSendingEmail(true);
                              try {
                                if (!userEmail) return;
                                // mark pending delete to auto-complete after email login
                                try {
                                  window.localStorage.setItem(
                                    "brickai.pendingDeletePortfolio",
                                    portfolio.portfolio_id
                                  );
                                  window.localStorage.setItem(
                                    "brickai.pendingDeleteSetAt",
                                    new Date().toISOString()
                                  );
                                } catch {}
                                const { error } = await supabase.auth.signInWithOtp({
                                  email: userEmail,
                                  options: { emailRedirectTo: `${window.location.origin}/app/hub` },
                                });
                                if (error) throw error;
                                setEmailNotice(`We sent a verification link to ${userEmail}. Please check your inbox (and spam).`);
                              } catch (e: any) {
                                const msg = e?.message || "Failed to send verification email.";
                                setEmailError(msg);
                              } finally {
                                setSendingEmail(false);
                              }
                            }}
                          >
                            {sendingEmail ? "Sending..." : "Send verification email"}
                          </Button>
                        </div>
                        {emailNotice && (
                          <div className="text-xs text-green-600">{emailNotice}</div>
                        )}
                        {emailError && (
                          <div className="text-xs text-red-600">{emailError}</div>
                        )}
                        <p className="text-xs text-muted-foreground">
                          After you open the link and finish login, we’ll delete this portfolio automatically.
                        </p>
                      </>
                    ) : (
                      <>
                        <Label htmlFor="pdel">Confirm your password to delete this portfolio</Label>
                        <Input
                          id="pdel"
                          type="password"
                          value={pwd}
                          onChange={(e) => {
                            setPwd(e.target.value);
                            if (deleteError) setDeleteError(null);
                          }}
                          placeholder="Your account password"
                        />
                        {deleteError && (
                          <div className="text-xs text-red-600">{deleteError}</div>
                        )}
                        <div className="flex items-center gap-3">
                          <Button
                            variant="destructive"
                            disabled={!pwd || deleting || !onDeletePortfolio}
                            onClick={async () => {
                              if (!onDeletePortfolio) return;
                              setDeleteError(null);
                              setDeleting(true);
                              try {
                                await onDeletePortfolio(portfolio.portfolio_id, pwd);
                                setEditOpen(false);
                                setPwd("");
                              } catch (e: any) {
                                const msg = e?.message || "Incorrect password";
                                setDeleteError(msg);
                              } finally {
                                setDeleting(false);
                              }
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> {deleting ? "Deleting..." : "Delete Portfolio"}
                          </Button>
                        </div>
                      </>
                    )}
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
          <DialogContent className="w-[95vw] sm:max-w-[720px] md:max-w-[864px] lg:max-w-[960px] max-h-[85vh] overflow-y-auto scrollbar-purple">
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
        <DialogContent className="w-[95vw] sm:max-w-[720px] md:max-w-[864px] lg:max-w-[960px] max-h-[85vh] overflow-y-auto scrollbar-purple">
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
