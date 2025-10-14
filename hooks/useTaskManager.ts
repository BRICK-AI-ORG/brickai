import { useState, useEffect } from "react";
import { Task, TaskImage } from "@/types/models";
import { createBrowserClient } from '@supabase/ssr'
import {
  TaskState,
  TasksState,
  TaskOperations,
  TasksOperations,
} from "@/types/taskManager";

const MAX_FILE_SIZE = 1024 * 1024; // 1MB
const FUNCTION_ENDPOINT = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-task-with-ai`;

interface UseTaskManagerReturn
  extends TaskState,
    TasksState,
    TaskOperations,
    TasksOperations {}

export function useTaskManager(taskId?: string): UseTaskManagerReturn {
  // State for single task management
  const [task, setTask] = useState<Task | null>(null);
  const [date, setDate] = useState<Date | undefined>(undefined);

  // State for task list management
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<TaskImage[]>([]);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Fetch single task
  useEffect(() => {
    if (!taskId) return;

    const fetchTask = async () => {
      try {
        const { data: task, error } = await supabase
          .from("tasks")
          .select("*")
          .eq("task_id", taskId)
          .single();

        if (error) throw error;
        setTask(task);
        setDate(task.due_date ? new Date(task.due_date) : undefined);
        // fetch images for this task
        const { data: imgs } = await supabase
          .from("task_images")
          .select("image_id, task_id, path, created_at")
          .eq("task_id", taskId)
          .order("created_at", { ascending: true });
        setImages(imgs || []);
      } catch (error: any) {
        console.error(`Error fetching task ID ${taskId}:`, error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTask();
  }, [taskId]);

  // Fetch all tasks
  useEffect(() => {
    if (taskId) return; // Don't fetch all tasks if we're managing a single task
    fetchTasks();
  }, []);

  // Single task operations
  const updateTask = (updates: Partial<Task>) => {
    setTask((prev) => (prev ? { ...prev, ...updates } : null));
  };

  const saveTask = async (taskToSave?: Task) => {
    try {
      const taskData = taskToSave || task;
      if (!taskData) throw new Error("No task data to save");

      const nextStatus = (taskData as any).completed ? 'done' : ((taskData as any).status ?? 'todo');
      const safeUpdate: Partial<Task> & { due_date?: string; updated_at: string } = {
        title: taskData.title,
        description: taskData.description,
        completed: taskData.completed ?? false,
        status: nextStatus as any,
        label: (taskData as any).label,
        priority: (taskData as any).priority ?? 'medium',
        // Allow image_url to be updated via internal flows (upload/remove)
        image_url: (taskToSave as any)?.image_url ?? task?.image_url ?? null,
        // Preserve association if provided (no user_id changes)
        portfolio_id: (taskData as any).portfolio_id ?? null,
        due_date: date?.toISOString().split("T")[0],
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("tasks")
        .update(safeUpdate)
        .eq("task_id", taskData.task_id);

      if (error) throw error;
    } catch (error: any) {
      console.error("Error saving task:", error);
      setError(error.message);
      throw error;
    }
  };

  const signImagePath = async (path: string) => {
    try {
      const { data, error } = await supabase.storage
        .from("task-attachments")
        .createSignedUrl(path, 60 * 60);
      if (error) throw error;
      return data.signedUrl;
    } catch {
      return "";
    }
  };

  const uploadImage = async (file: File) => {
    try {
      if (file.size > MAX_FILE_SIZE) {
        throw new Error("File size must be less than 1MB");
      }

      if (!task) throw new Error("No task found");

      // Multi-image support: append new image if under 5
      if (images.length >= 5) throw new Error("Max 5 images per task");
      const ext = file.name.split(".").pop();
      const path = `${task.user_id}/${task.task_id}-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("task-attachments")
        .upload(path, file, { upsert: false, contentType: file.type });
      if (uploadError) throw uploadError;
      const { data: row, error: insErr } = await supabase
        .from("task_images")
        .insert({ task_id: task.task_id, path })
        .select("image_id, task_id, path, created_at")
        .single();
      if (insErr) throw insErr;
      setImages((prev) => [...prev, row!]);
      const signed = await signImagePath(path);
      setSignedUrls((prev) => ({ ...prev, [row!.image_id]: signed }));
    } catch (error: any) {
      console.error("Error uploading image:", error);
      setError(error.message);
      throw error;
    }
  };

  const removeImage = async () => {
    try {
      if (!task?.image_url) throw new Error("No image to remove");

      const fileName = task.image_url;
      const { error: storageError } = await supabase.storage
        .from("task-attachments")
        .remove([fileName]);

      if (storageError) throw storageError;

      const updatedTask = { ...task, image_url: null };
      setTask(updatedTask);
      await saveTask(updatedTask);
    } catch (error: any) {
      console.error("Error removing image:", error);
      setError(error.message);
      throw error;
    }
  };

  // Task list operations
  const fetchTasks = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", session!.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTasks(data || []);
      setError(null);
    } catch (error: any) {
      console.error("Error fetching tasks:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Multi-image helpers
  const listImages = async (tid: string) => {
    const { data } = await supabase
      .from("task_images")
      .select("image_id, task_id, path, created_at")
      .eq("task_id", tid)
      .order("created_at", { ascending: true });
    setImages(data || []);
    const mapping: Record<string, string> = {};
    await Promise.all(
      (data || []).map(async (it) => {
        mapping[it.image_id] = await signImagePath(it.path);
      })
    );
    setSignedUrls(mapping);
  };

  const uploadImages = async (files: File[]) => {
    for (const f of files.slice(0, Math.max(0, 5 - images.length))) {
      await uploadImage(f);
    }
  };

  const removeImageById = async (imageId: string) => {
    const img = images.find((i) => i.image_id === imageId);
    if (!img) return;
    await supabase.storage.from("task-attachments").remove([img.path]).catch(() => {});
    const { error } = await supabase.from("task_images").delete().eq("image_id", imageId);
    if (error) throw error;
    setImages((prev) => prev.filter((i) => i.image_id !== imageId));
    setSignedUrls((prev) => {
      const c = { ...prev } as any;
      delete c[imageId];
      return c;
    });
  };

  const createTask = async (title: string, description: string) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const response = await fetch(FUNCTION_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session!.access_token}`,
        },
        body: JSON.stringify({ title, description }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create task");
      }

      const taskData = await response.json();
      if (!taskData) throw new Error("No data returned from server");

      setTasks([taskData, ...tasks]);
      setError(null);
      return taskData;
    } catch (error: any) {
      console.error("Error creating task:", error);
      setError(error.message);
      throw error;
    }
  };

  const deleteTask = async (taskIdToDelete: string) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("task_id", taskIdToDelete);

      if (error) throw error;
      setTasks(tasks.filter((t) => t.task_id !== taskIdToDelete));
      setError(null);
    } catch (error: any) {
      console.error("Error deleting task:", error);
      setError(error.message);
      throw error;
    }
  };

  const toggleTaskComplete = async (
    taskIdToToggle: string,
    completed: boolean
  ) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .update({ completed, status: completed ? 'done' : 'todo', updated_at: new Date().toISOString() })
        .eq("task_id", taskIdToToggle);

      if (error) throw error;
      setTasks(
        tasks.map((t) =>
          t.task_id === taskIdToToggle ? { ...t, completed, status: completed ? 'done' : 'todo', updated_at: new Date().toISOString() } : t
        )
      );
      setError(null);
    } catch (error: any) {
      console.error("Error updating task:", error);
      setError(error.message);
      throw error;
    }
  };

  const refreshTasks = async () => {
    setIsLoading(true);
    await fetchTasks();
  };

  return {
    // State
    task,
    tasks,
    date,
    error,
    isLoading,
    images,
    signedUrls,

    // Single task operations
    setDate,
    updateTask,
    saveTask,
    uploadImage,
    removeImage,
    uploadImages,
    listImages,
    removeImageById,

    // Task list operations
    createTask,
    deleteTask,
    toggleTaskComplete,
    refreshTasks,
  };
}
