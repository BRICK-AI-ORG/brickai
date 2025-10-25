import { Portfolio, Task } from "@/types/models";
import TaskList from "@/components/TaskList";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CreateTaskForm } from "@/components/CreateTaskForm";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
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
  onEditPortfolio?: (
    id: string,
    updates: { name?: string; description?: string | null }
  ) => Promise<void>;
  onDeletePortfolio?: (id: string, password: string) => Promise<void>;
}

const LARGE_DIALOG_CONTENT_CLASS =
  "max-w-[95vw] sm:max-w-[720px] md:max-w-[864px] lg:max-w-[960px] max-h-[85vh] overflow-y-auto scrollbar-purple";

export function PortfolioCard({
  portfolio,
  tasks,
  onCreateTask,
  onDeleteTask,
  onEditPortfolio,
  onDeletePortfolio,
}: PortfolioCardProps) {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [taskPanelMode, setTaskPanelMode] = useState<"view" | "edit">("view");
  const [name, setName] = useState(portfolio.name);
  const [description, setDescription] = useState(portfolio.description ?? "");
  const [pwd, setPwd] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [savingPortfolio, setSavingPortfolio] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
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

  useEffect(() => {
    if (!editOpen) {
      setName(portfolio.name);
      setDescription(portfolio.description ?? "");
      setPwd("");
      setDeleteError(null);
      setSaveError(null);
      setEmailNotice(null);
      setEmailError(null);
      setSavingPortfolio(false);
    }
  }, [
    editOpen,
    portfolio.description,
    portfolio.name,
  ]);

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

  const handlePortfolioSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!onEditPortfolio) return;
    const trimmedName = name.trim();
    const trimmedDescription = description.trim();
    if (!trimmedName) {
      setSaveError("Name is required.");
      return;
    }
    setSaveError(null);
    setSavingPortfolio(true);
    try {
      await onEditPortfolio(portfolio.portfolio_id, {
        name: trimmedName,
        description: trimmedDescription ? trimmedDescription : null,
      });
      setEditOpen(false);
    } catch (e: any) {
      const message =
        e?.message && typeof e.message === "string" ? e.message : "Failed to update portfolio.";
      setSaveError(message);
    } finally {
      setSavingPortfolio(false);
    }
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
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <PlusCircle className="mr-2 h-4 w-4" /> New Task
              </Button>
            </DialogTrigger>
            <DialogContent className={LARGE_DIALOG_CONTENT_CLASS}>
              <div className="space-y-6">
                <DialogHeader>
                  <DialogTitle>Create Task in {portfolio.name}</DialogTitle>
                  <DialogDescription>Enter the details for your new task.</DialogDescription>
                </DialogHeader>
                <CreateTaskForm onSubmit={handleCreate} />
              </div>
            </DialogContent>
          </Dialog>
          {onEditPortfolio && (
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Pencil className="mr-2 h-4 w-4" /> Edit
                </Button>
              </DialogTrigger>
              <DialogContent className={LARGE_DIALOG_CONTENT_CLASS}>
                <div className="space-y-6">
                  <DialogHeader>
                    <DialogTitle>Edit Portfolio</DialogTitle>
                    <DialogDescription>Update the name and description.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handlePortfolioSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="pname">Name</Label>
                      <Input
                        id="pname"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pdesc">Description</Label>
                      <Textarea
                        id="pdesc"
                        value={description}
                        onChange={(e) => setDescription(e.target.value.slice(0, 100))}
                        rows={4}
                        maxLength={100}
                      />
                      <div className="text-xs text-muted-foreground text-right">
                        {description.length}/100
                      </div>
                    </div>
                    {saveError && <p className="text-sm text-red-600">{saveError}</p>}
                    <DialogFooter className="space-y-2 pt-4 sm:space-y-0">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full sm:w-auto"
                        onClick={() => setEditOpen(false)}
                        disabled={savingPortfolio}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="w-full sm:w-auto"
                        disabled={savingPortfolio || !name.trim()}
                      >
                        {savingPortfolio ? "Saving..." : "Save Changes"}
                      </Button>
                    </DialogFooter>
                  </form>
                  <section className="space-y-3 rounded-md border border-destructive/20 bg-destructive/5 p-4">
                    <div className="space-y-1">
                      <h3 className="text-sm font-semibold text-destructive">Danger zone</h3>
                      <p className="text-xs text-muted-foreground">
                        Permanently delete this portfolio and its tasks.
                      </p>
                    </div>
                    {authProvider === "google" ? (
                      <>
                        <Label>Verify via email to delete this portfolio</Label>
                        <p className="text-sm text-muted-foreground">
                          This account uses Google sign-in. Send a verification link to{" "}
                          {userEmail || "your email"} and follow it, then return here.
                        </p>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                          <Button
                            type="button"
                            variant="destructive"
                            className="w-full sm:w-auto"
                            disabled={sendingEmail || !userEmail}
                            onClick={async () => {
                              setEmailNotice(null);
                              setEmailError(null);
                              setSendingEmail(true);
                              try {
                                if (!userEmail) return;
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
                                setEmailNotice(
                                  `We sent a verification link to ${userEmail}. Please check your inbox (and spam).`
                                );
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
                        {emailNotice && <div className="text-xs text-green-600">{emailNotice}</div>}
                        {emailError && <div className="text-xs text-red-600">{emailError}</div>}
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
                        {deleteError && <div className="text-xs text-red-600">{deleteError}</div>}
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <Button
                            variant="destructive"
                            className="w-full sm:w-auto"
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
                            <Trash2 className="mr-2 h-4 w-4" />{" "}
                            {deleting ? "Deleting..." : "Delete Portfolio"}
                          </Button>
                        </div>
                      </>
                    )}
                  </section>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
      <div className="bg-transparent">
        <TaskList
          tasks={tasks}
          onSelect={(taskId) => {
            setActiveTaskId(taskId);
            setTaskPanelMode("view");
          }}
        />
      </div>
      <Dialog
        open={!!activeTaskId}
        onOpenChange={(open) => {
          if (!open) {
            setActiveTaskId(null);
            setTaskPanelMode("view");
          }
        }}
      >
        <DialogContent className={LARGE_DIALOG_CONTENT_CLASS}>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 pr-6">
              <DialogTitle className="text-xl font-semibold">Task Details</DialogTitle>
              <DialogDescription>
                {taskPanelMode === "edit" ? "Update task information." : "Review task information."}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2 mt-8 sm:mt-0 sm:mr-10">
              <Button
                type="button"
                variant={taskPanelMode === "view" ? "default" : "outline"}
                size="sm"
                onClick={() => setTaskPanelMode("view")}
              >
                View
              </Button>
              <Button
                type="button"
                variant={taskPanelMode === "edit" ? "default" : "outline"}
                size="sm"
                onClick={() => setTaskPanelMode("edit")}
              >
                Edit
              </Button>
            </div>
          </div>
          <div className="mt-5">
            {activeTaskId && (
              <TaskEditor
                taskId={activeTaskId}
                initialMode={taskPanelMode}
                onModeChange={setTaskPanelMode}
                onDeleteTask={async (taskId) => {
                  await onDeleteTask(taskId);
                  setActiveTaskId(null);
                  setTaskPanelMode("view");
                }}
                onClose={() => {
                  setActiveTaskId(null);
                  setTaskPanelMode("view");
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
