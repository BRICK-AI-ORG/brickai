import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Portfolio, Task } from "@/types/models";
import {
  emitTaskCreated,
  emitTaskDeleted,
  emitTaskUpdated,
  TASK_CREATED_EVENT,
  TASK_DELETED_EVENT,
  TASK_UPDATED_EVENT,
  type TaskCreatedDetail,
  type TaskDeletedDetail,
  type TaskUpdatedDetail,
} from "@/lib/task-events";

type PortfolioWithTasks = {
  portfolio: Portfolio;
  tasks: Task[];
};

export function usePortfolioManager() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [items, setItems] = useState<PortfolioWithTasks[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchAll() {
    try {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { data: portfolios, error: pErr } = await supabase
        .from("portfolios")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: true });
      if (pErr) throw pErr;

      const ids = (portfolios ?? []).map((p) => p.portfolio_id);
      let tasksById: Record<string, Task[]> = {};
      if (ids.length > 0) {
        const { data: tasks, error: tErr } = await supabase
          .from("tasks")
          .select("*")
          .in("portfolio_id", ids)
          .order("created_at", { ascending: false });
        if (tErr) throw tErr;
        for (const t of tasks ?? []) {
          const pid = t.portfolio_id as string;
          if (!tasksById[pid]) tasksById[pid] = [];
          tasksById[pid].push(t);
        }
      }

      const list: PortfolioWithTasks[] = (portfolios ?? []).map((p) => ({
        portfolio: p,
        tasks: tasksById[p.portfolio_id] ?? [],
      }));
      setItems(list);
      setError(null);
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  const applyTaskCreation = (task: Task) => {
    if (!task.portfolio_id) {
      void fetchAll();
      return;
    }

    let portfolioFound = false;
    let inserted = false;
    setItems((prev) => {
      const next = prev.map((entry) => {
        if (entry.portfolio.portfolio_id !== task.portfolio_id) return entry;
        portfolioFound = true;
        if (entry.tasks.some((t) => t.task_id === task.task_id)) {
          return entry;
        }
        inserted = true;
        return { ...entry, tasks: [task, ...entry.tasks] };
      });
      if (!portfolioFound || !inserted) {
        return prev;
      }
      return next;
    });

    if (!portfolioFound) {
      void fetchAll();
    }
  };

  const applyTaskUpdate = (task: Task, previousPortfolioId?: string | null) => {
    let updatedInTarget = false;
    let touched = false;
    setItems((prev) => {
      const next = prev.map((entry) => {
        let tasks = entry.tasks;

        if (entry.portfolio.portfolio_id === task.portfolio_id) {
          updatedInTarget = true;
          touched = true;
          const exists = tasks.some((t) => t.task_id === task.task_id);
          tasks = exists
            ? tasks.map((t) => (t.task_id === task.task_id ? { ...t, ...task } : t))
            : [task, ...tasks];
          return { ...entry, tasks };
        }

        if (
          previousPortfolioId &&
          previousPortfolioId !== task.portfolio_id &&
          entry.portfolio.portfolio_id === previousPortfolioId
        ) {
          const filtered = tasks.filter((t) => t.task_id !== task.task_id);
          if (filtered.length !== tasks.length) {
            touched = true;
            return { ...entry, tasks: filtered };
          }
        }

        return entry;
      });

      return touched ? next : prev;
    });

    if (!updatedInTarget) {
      void fetchAll();
    }
  };

  const applyTaskDeletion = (taskId: string, portfolioId?: string | null) => {
    let removed = false;
    setItems((prev) => {
      const next = prev.map((entry) => {
        if (portfolioId && entry.portfolio.portfolio_id !== portfolioId) return entry;
        const filtered = entry.tasks.filter((t) => t.task_id !== taskId);
        if (filtered.length !== entry.tasks.length) {
          removed = true;
          return { ...entry, tasks: filtered };
        }
        return entry;
      });

      return removed ? next : prev;
    });

    if (!removed) {
      void fetchAll();
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleTaskCreated = (event: Event) => {
      const detail = (event as CustomEvent<TaskCreatedDetail>).detail;
      if (!detail?.task) return;
      applyTaskCreation(detail.task);
    };

    const handleTaskUpdated = (event: Event) => {
      const detail = (event as CustomEvent<TaskUpdatedDetail>).detail;
      if (!detail?.task) return;
      applyTaskUpdate(detail.task, detail.previousPortfolioId);
    };

    const handleTaskDeleted = (event: Event) => {
      const detail = (event as CustomEvent<TaskDeletedDetail>).detail;
      if (!detail) return;
      applyTaskDeletion(detail.taskId, detail.portfolioId);
    };

    window.addEventListener(TASK_CREATED_EVENT, handleTaskCreated as EventListener);
    window.addEventListener(TASK_UPDATED_EVENT, handleTaskUpdated as EventListener);
    window.addEventListener(TASK_DELETED_EVENT, handleTaskDeleted as EventListener);

    return () => {
      window.removeEventListener(TASK_CREATED_EVENT, handleTaskCreated as EventListener);
      window.removeEventListener(TASK_UPDATED_EVENT, handleTaskUpdated as EventListener);
      window.removeEventListener(TASK_DELETED_EVENT, handleTaskDeleted as EventListener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createPortfolio(name: string, description?: string | null) {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("portfolios")
        .insert({ name, description: description ?? null, user_id: session.user.id })
        .select()
        .single();
      if (error) throw error;
      setItems((prev) => [{ portfolio: data, tasks: [] }, ...prev]);
      return data;
    } catch (e) {
      throw e;
    }
  }

  async function updatePortfolio(
    portfolioId: string,
    updates: { name?: string; description?: string | null }
  ) {
    try {
      const { data, error } = await supabase
        .from("portfolios")
        .update({
          ...(updates.name !== undefined ? { name: updates.name } : {}),
          ...(updates.description !== undefined
            ? { description: updates.description }
            : {}),
          updated_at: new Date().toISOString(),
        })
        .eq("portfolio_id", portfolioId)
        .select()
        .single();
      if (error) throw error;
      setItems((prev) =>
        prev.map((it) =>
          it.portfolio.portfolio_id === portfolioId
            ? { ...it, portfolio: { ...it.portfolio, ...data } }
            : it
        )
      );
      return data;
    } catch (e) {
      throw e;
    }
  }

  async function deletePortfolio(portfolioId: string) {
    try {
      const { error } = await supabase
        .from("portfolios")
        .delete()
        .eq("portfolio_id", portfolioId);
      if (error) throw error;
      setItems((prev) => prev.filter((it) => it.portfolio.portfolio_id !== portfolioId));
    } catch (e) {
      throw e;
    }
  }

  async function deletePortfolioWithPassword(portfolioId: string, password: string) {
    // Re-authenticate the current user to verify password before destructive action
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user?.email) throw new Error("Not authenticated");

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: session.user.email,
      password,
    });
    if (authError) throw new Error("Incorrect password");

    await deletePortfolio(portfolioId);
  }

  const FUNCTION_ENDPOINT = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-task-with-ai`;

  async function createTask(
    portfolioId: string,
    title: string,
    description: string,
    options?: { dueDate?: string | null; imageFiles?: File[] | null; priority?: string | null; label?: string | null }
  ) {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) throw new Error("Not authenticated");

    let task: Task | null = null;
    try {
      const response = await fetch(FUNCTION_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ title, description, portfolio_id: portfolioId }),
      });
      if (!response.ok) {
        throw new Error(`Function error ${response.status}`);
      }
      task = (await response.json()) as Task;
    } catch (_fnErr) {
      // Fallback: direct insert without AI label if function fails (e.g. not deployed)
      const { data, error } = await supabase
        .from("tasks")
        .insert({
          title,
          description,
          completed: false,
          status: 'todo',
          user_id: session.user.id,
          portfolio_id: portfolioId,
          priority: options?.priority ?? 'medium',
          due_date: options?.dueDate ?? null,
          label: options?.label ?? null,
        })
        .select()
        .single();
      if (error) throw error;
      task = data as Task;
    }

    // Optional: update due date/priority in one roundtrip
    const shouldUpdateMetadata =
      !!options?.dueDate || !!options?.priority || options?.label !== undefined;
    if (shouldUpdateMetadata) {
      const updates: any = { updated_at: new Date().toISOString() };
      if (options?.dueDate) updates.due_date = options.dueDate;
      if (options?.priority) updates.priority = options.priority;
      if (options?.label !== undefined) updates.label = options.label ?? null;
      const { data: upd, error: dueErr } = await supabase
        .from("tasks")
        .update(updates)
        .eq("task_id", task!.task_id)
        .select()
        .single();
      if (!dueErr && upd) task = upd as Task;
    }

    // Optional: upload image and update image_url
    if (options?.imageFiles && options.imageFiles.length > 0) {
      const files = options.imageFiles.slice(0, 5);
      for (const file of files) {
        const ext = file.name.split(".").pop();
        const path = `${session.user.id}/${task!.task_id}-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("task-attachments")
          .upload(path, file, { upsert: false, contentType: file.type });
        if (!uploadError) {
          await supabase.from("task_images").insert({ task_id: task!.task_id, path });
        }
      }
    }

    setItems((prev) =>
      prev.map((it) =>
        it.portfolio.portfolio_id === portfolioId
          ? { ...it, tasks: [task!, ...it.tasks] }
          : it
      )
    );
    emitTaskCreated(task!);
    return task!;
  }

  async function deleteTask(taskId: string) {
    const currentTask = items.flatMap((it) => it.tasks).find((t) => t.task_id === taskId);

    const { data: imageRows } = await supabase
      .from("task_images")
      .select("path")
      .eq("task_id", taskId);

    const removalTargets = [
      ...(imageRows?.map((img) => img.path) ?? []),
      ...(currentTask?.image_url ? [currentTask.image_url] : []),
    ];

    if (removalTargets.length > 0) {
      await supabase.storage
        .from("task-attachments")
        .remove(removalTargets)
        .catch(() => {});
    }

    if (imageRows && imageRows.length > 0) {
      const { error: deleteImageRowsError } = await supabase
        .from("task_images")
        .delete()
        .eq("task_id", taskId);
      if (deleteImageRowsError) {
        console.error("Failed to remove task image records", deleteImageRowsError);
      }
    }

    const { error } = await supabase.from("tasks").delete().eq("task_id", taskId);
    if (error) throw error;
    setItems((prev) =>
      prev.map((it) => ({ ...it, tasks: it.tasks.filter((t) => t.task_id !== taskId) }))
    );
    emitTaskDeleted(taskId, currentTask?.portfolio_id ?? null);
  }

  async function toggleTaskComplete(taskId: string, completed: boolean) {
    const currentTask = items.flatMap((it) => it.tasks).find((t) => t.task_id === taskId) ?? null;
    const updatedAt = new Date().toISOString();
    const { error } = await supabase
      .from("tasks")
      .update({ completed, status: completed ? 'done' : 'todo', updated_at: updatedAt })
      .eq("task_id", taskId);
    if (error) throw error;
    setItems((prev) =>
      prev.map((it) => ({
        ...it,
        tasks: it.tasks.map((t) =>
          t.task_id === taskId ? { ...t, completed, status: completed ? 'done' : 'todo', updated_at: updatedAt } : t
        ),
      }))
    );
    if (currentTask) {
      emitTaskUpdated(
        { ...currentTask, completed, status: completed ? ("done" as any) : ("todo" as any), updated_at: updatedAt },
        currentTask.portfolio_id ?? null
      );
    }
  }

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    items,
    loading,
    error,
    refresh: fetchAll,
    createPortfolio,
    updatePortfolio,
    deletePortfolio,
    deletePortfolioWithPassword,
    createTask,
    deleteTask,
    toggleTaskComplete,
  };
}
