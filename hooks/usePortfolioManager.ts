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

  const FUNCTION_ENDPOINT = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-task-with-ai`;

  async function createTask(portfolioId: string, title: string, description: string) {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) throw new Error("Not authenticated");

    const response = await fetch(FUNCTION_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ title, description, portfolio_id: portfolioId }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create task");
    }
    const task = (await response.json()) as Task;
    setItems((prev) =>
      prev.map((it) =>
        it.portfolio.portfolio_id === portfolioId
          ? { ...it, tasks: [task, ...it.tasks] }
          : it
      )
    );
    return task;
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
      .update({ completed })
      .eq("task_id", taskId);
    if (error) throw error;
    setItems((prev) =>
      prev.map((it) => ({
        ...it,
        tasks: it.tasks.map((t) => (t.task_id === taskId ? { ...t, completed } : t)),
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
    createTask,
    deleteTask,
    toggleTaskComplete,
  };
}

