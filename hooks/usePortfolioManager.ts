import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Portfolio, Task } from "@/types/models";

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
    options?: { dueDate?: string | null; imageFiles?: File[] | null; priority?: string | null }
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
        })
        .select()
        .single();
      if (error) throw error;
      task = data as Task;
    }

    // Optional: update due date/priority in one roundtrip
    if (options?.dueDate || options?.priority) {
      const updates: any = { updated_at: new Date().toISOString() };
      if (options?.dueDate) updates.due_date = options.dueDate;
      if (options?.priority) updates.priority = options.priority;
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
    return task!;
  }

  async function deleteTask(taskId: string) {
    const { error } = await supabase.from("tasks").delete().eq("task_id", taskId);
    if (error) throw error;
    setItems((prev) =>
      prev.map((it) => ({ ...it, tasks: it.tasks.filter((t) => t.task_id !== taskId) }))
    );
  }

  async function toggleTaskComplete(taskId: string, completed: boolean) {
    const { error } = await supabase
      .from("tasks")
      .update({ completed, status: completed ? 'done' : 'todo', updated_at: new Date().toISOString() })
      .eq("task_id", taskId);
    if (error) throw error;
    setItems((prev) =>
      prev.map((it) => ({
        ...it,
        tasks: it.tasks.map((t) => (t.task_id === taskId ? { ...t, completed, status: completed ? 'done' : 'todo', updated_at: new Date().toISOString() } : t)),
      }))
    );
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
