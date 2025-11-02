"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Plus, Save, Trash2 } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { createBrowserClient } from "@supabase/ssr";
import { labels, getLabelColors, type LabelType } from "@/lib/labels";
import { labelIconMap } from "@/components/task-label-icons";
import { priorityAppearanceList, priorityAppearanceMap } from "@/components/task-priority";
import { getPriorityColors, normalizePriority, type Priority } from "@/lib/priority";
import { useTaskManager } from "@/hooks/useTaskManager";
import { useToast } from "@/components/hooks/use-toast";
import { ensureSignedUrl, getCachedSignedUrl } from "@/lib/signedUrlCache";
import { cn } from "@/lib/utils";
import type { Task } from "@/types/models";

const MAX_IMAGES = 5;

export type TaskEditorMode = "view" | "edit";

type TaskFieldUpdaters = {
  updateTitle: (title: string) => void;
  updateDescription: (description: string) => void;
};

type TaskEditorProps = {
  taskId: string;
  initialMode?: TaskEditorMode;
  onModeChange?: (mode: TaskEditorMode) => void;
  onDeleteTask?: (taskId: string) => Promise<void> | void;
  onClose?: () => void;
  onTaskTitleChange?: (title: string) => void;
  onTaskDescriptionChange?: (description: string) => void;
  onRegisterTaskFieldUpdaters?: (handlers: TaskFieldUpdaters | null) => void;
};

export default function TaskEditor({
  taskId,
  initialMode = "view",
  onModeChange,
  onDeleteTask,
  onClose,
  onTaskTitleChange,
  onTaskDescriptionChange,
  onRegisterTaskFieldUpdaters,
}: TaskEditorProps) {
  const {
    task,
    date,
    setDate,
    updateTask,
    saveTask,
    deleteTask: deleteTaskMut,
    uploadImage,
    uploadImages,
    removeImage,
    removeImageById,
    listImages,
    images,
    signedUrls,
    isLoading,
    error,
  } = useTaskManager(taskId) as any;

  const { toast } = useToast();
  const supabase = useMemo(
    () => createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!),
    []
  );

  const [dueDateOpen, setDueDateOpen] = useState(false);
  const [mode, setModeState] = useState<TaskEditorMode>(initialMode);
  const [legacySignedUrl, setLegacySignedUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const setMode = useCallback(
    (next: TaskEditorMode) => {
      setModeState(next);
      onModeChange?.(next);
    },
    [onModeChange]
  );

  useEffect(() => {
    setModeState(initialMode);
  }, [initialMode, taskId]);

  useEffect(() => {
    if (!onRegisterTaskFieldUpdaters) return;
    const handlers: TaskFieldUpdaters = {
      updateTitle: (nextTitle) => {
        updateTask({ title: nextTitle });
      },
      updateDescription: (nextDescription) => {
        const limited = nextDescription.slice(0, 100);
        updateTask({ description: limited });
      },
    };
    onRegisterTaskFieldUpdaters(handlers);
    return () => {
      onRegisterTaskFieldUpdaters(null);
    };
  }, [onRegisterTaskFieldUpdaters, updateTask]);

  const isEditing = mode === "edit";
  useEffect(() => {
    if (!isEditing) {
      setDueDateOpen(false);
    }
  }, [isEditing]);

  useEffect(() => {
    if (!taskId) return;
    let cancelled = false;

    (async () => {
      try {
        if (listImages) {
          await listImages(taskId);
        }
      } catch {
        // swallow
      }

      const path = task?.image_url;
      if (!path) {
        if (!cancelled) setLegacySignedUrl(null);
        return;
      }

      const cached = getCachedSignedUrl(path);
      if (cached) {
        if (!cancelled) setLegacySignedUrl(cached);
        return;
      }

      try {
        const signed = await ensureSignedUrl(supabase, "task-attachments", path);
        if (!cancelled) setLegacySignedUrl(signed);
      } catch {
        if (!cancelled) setLegacySignedUrl(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [task?.image_url, supabase, listImages, taskId]);

  const handleImageUpload = useCallback(
    async (acceptedFiles: File[]) => {
      if (!isEditing || !acceptedFiles.length) return;
      try {
        setUploading(true);
        if (uploadImages) {
          await uploadImages(acceptedFiles);
        } else if (uploadImage) {
          await uploadImage(acceptedFiles[0]);
        }
        toast({ title: "Image uploaded", description: "Your attachment is ready." });
      } catch (err: any) {
        toast({
          title: "Upload failed",
          description: err?.message ?? "We couldn't upload that image.",
          variant: "destructive",
        });
      } finally {
        setUploading(false);
      }
    },
    [isEditing, toast, uploadImage, uploadImages]
  );

  const canUploadMore = (images?.length ?? 0) < MAX_IMAGES;
  const dropzoneDisabled = !isEditing || !canUploadMore;

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop: handleImageUpload,
    accept: { "image/jpeg": [], "image/png": [], "image/webp": [] },
    maxFiles: Math.max(0, MAX_IMAGES - (images?.length ?? 0)),
    noClick: true,
    noKeyboard: true,
    multiple: true,
    disabled: dropzoneDisabled,
  });

  const dropzoneRootProps = getRootProps();
  const dropzoneInputProps = getInputProps();

  const handleRemoveLegacyImage = useCallback(async () => {
    if (!isEditing || !task?.image_url) return;
    try {
      await removeImage();
      toast({ title: "Image removed", description: "The attachment has been deleted." });
      setLegacySignedUrl(null);
    } catch (err: any) {
      toast({
        title: "Remove failed",
        description: err?.message ?? "Unable to remove the attachment.",
        variant: "destructive",
      });
    }
  }, [isEditing, removeImage, task?.image_url, toast]);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!isEditing) return;
      try {
        await saveTask();
        toast({ title: "Task updated", description: "Changes saved successfully." });
        setMode("view");
        setDueDateOpen(false);
      } catch (err: any) {
        toast({
          title: "Update failed",
          description: err?.message ?? "Unable to save your changes.",
          variant: "destructive",
        });
      }
    },
    [isEditing, saveTask, setMode, toast]
  );

  const performDelete = useCallback(async () => {
    if (!task) return;
    try {
      setDeleting(true);
      if (onDeleteTask) {
        await onDeleteTask(task.task_id);
      } else if (deleteTaskMut) {
        await deleteTaskMut(task.task_id);
      }
      toast({ title: "Task deleted", description: "The task has been removed." });
      onClose?.();
    } catch (err: any) {
      toast({
        title: "Delete failed",
        description: err?.message ?? "Unable to delete this task.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  }, [deleteTaskMut, onClose, onDeleteTask, task, toast]);

  const handleConfirmDelete = useCallback(async () => {
    setDeleteConfirmOpen(false);
    await performDelete();
  }, [performDelete]);

  useEffect(() => {
    if (!task) return;
    onTaskTitleChange?.(task.title ?? "");
    onTaskDescriptionChange?.((task.description ?? "").slice(0, 100));
  }, [onTaskDescriptionChange, onTaskTitleChange, task]);

  if (isLoading || !task) {
    return <div className="py-8 text-center text-sm text-muted-foreground">Loading task...</div>;
  }

  const normalizedPriority = task.priority ? normalizePriority(task.priority) : null;
  const priorityMeta = normalizedPriority ? priorityAppearanceMap[normalizedPriority] : null;
  const PriorityIcon = priorityMeta?.Icon;

  const dueDateMeta = (() => {
    if (!task.due_date) return null;
    const dueDate = new Date(task.due_date);
    if (Number.isNaN(dueDate.getTime())) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffInDays = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    const duePriority: Priority =
      diffInDays < 0 ? "urgent" : diffInDays <= 7 ? "high" : diffInDays <= 14 ? "medium" : "low";

    const palette = getPriorityColors(duePriority);
    const labelPrefix = diffInDays < 0 ? "Overdue" : "Due";
    const fullDate = format(dueDate, "dd MMM yyyy");

    return {
      label: `${labelPrefix} ${fullDate}`,
      badgeClass: `${palette.bg} ${palette.text} ${palette.border}`,
    };
  })();

  const labelMeta = task.label ? labels.find((entry) => entry.value === task.label) ?? null : null;
  const labelColors = labelMeta ? getLabelColors(labelMeta.value) : null;
  const labelBadgeClass = labelColors
    ? `${labelColors["bg-color"]} ${labelColors["text-color"]} ${labelColors["border-color"]}`
    : "bg-muted text-muted-foreground border-border";
  const LabelIcon = labelMeta ? labelIconMap[labelMeta.value as LabelType] : undefined;

  const completionLabel = task.completed ? "Completed" : "Not Completed";
  const completionTextClass = task.completed ? "text-emerald-500 font-semibold" : "text-muted-foreground";

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <div className="flex w-full flex-col items-start gap-4 sm:w-[260px]">
          <button
            type="button"
            {...(!dropzoneDisabled ? dropzoneRootProps : {})}
            className={cn(
              "relative aspect-[4/3] w-full overflow-hidden rounded-md border bg-muted/40 transition",
              !dropzoneDisabled && "cursor-pointer hover:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/50",
              !dropzoneDisabled && isDragActive && "border-primary/60 bg-primary/10"
            )}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              if (!dropzoneDisabled) {
                open();
              }
            }}
            disabled={dropzoneDisabled || uploading}
          >
            {!dropzoneDisabled && <input {...dropzoneInputProps} className="hidden" />}
            {isEditing && (
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="absolute left-2 top-2 z-10 h-8 w-8 rounded-full border border-border/60 bg-background/90 text-foreground shadow-sm transition hover:bg-background disabled:opacity-60"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  if (!dropzoneDisabled) {
                    open();
                  }
                }}
                disabled={dropzoneDisabled || uploading}
              >
                <Plus className="h-4 w-4" aria-hidden />
                <span className="sr-only">Upload image</span>
              </Button>
            )}
            {images && images.length > 0 ? (
              <Image
                src={signedUrls?.[images[0].image_id] ?? "/placeholder.svg"}
                alt="Task preview"
                fill
                className="object-cover"
              />
            ) : legacySignedUrl ? (
              <Image src={legacySignedUrl} alt="Task preview" fill className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center px-4 text-center text-sm text-muted-foreground">
                No image provided.
              </div>
            )}
          </button>
        </div>

        <div className="flex-1 space-y-6">
          {isEditing ? (
            <>
              <div className="flex items-center gap-2 pt-1">
                <Checkbox
                  checked={task.completed || false}
                  onCheckedChange={(checked) => updateTask({ completed: checked === true })}
                  className={cn(
                    "h-4 w-4 border border-muted-foreground/40",
                    task.completed &&
                      "data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500 data-[state=checked]:text-emerald-50"
                  )}
                />
                <span className={cn("text-sm", completionTextClass)}>{completionLabel}</span>
              </div>

              <div className="grid gap-3 pt-1 sm:grid-cols-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold uppercase text-muted-foreground">Label</Label>
                  <Select value={task.label || ""} onValueChange={(value) => updateTask({ label: value as Task["label"] })}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a label" />
                    </SelectTrigger>
                    <SelectContent>
                      {labels
                        .filter((entry) => entry.value !== "priority")
                        .map((entry) => {
                          const Icon = labelIconMap[entry.value as LabelType];
                          return (
                            <SelectItem key={entry.value} value={entry.value}>
                              <div className="flex items-center gap-2">
                                {Icon && <Icon className="h-4 w-4 text-muted-foreground" aria-hidden />}
                                <span>{entry.label}</span>
                              </div>
                            </SelectItem>
                          );
                        })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold uppercase text-muted-foreground">Priority</Label>
                  <Select
                    value={task.priority || "medium"}
                    onValueChange={(value) => updateTask({ priority: value as Task["priority"] })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {priorityAppearanceList.map(({ value, label, Icon, iconClass }) => (
                        <SelectItem key={value} value={value}>
                          <div className="flex items-center gap-2">
                            {Icon && <Icon className={cn("h-4 w-4", iconClass)} aria-hidden />}
                            <span>{label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold uppercase text-muted-foreground">Due Date</Label>
                  <Popover open={isEditing ? dueDateOpen : false} onOpenChange={(open) => setDueDateOpen(open)}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(next) => {
                          setDate(next ?? undefined);
                          if (next) setDueDateOpen(false);
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={task.completed || false}
                  disabled
                  className={cn(
                    "pointer-events-none border border-muted-foreground/40 disabled:opacity-100",
                    task.completed
                      ? "data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500 data-[state=checked]:text-emerald-50"
                      : "opacity-60"
                  )}
                />
                <span className={cn("text-sm", completionTextClass)}>{completionLabel}</span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                {labelMeta && (
                  <Badge variant="outline" className={cn("gap-1.5", labelBadgeClass)}>
                    {LabelIcon && <LabelIcon className="h-3.5 w-3.5" aria-hidden />}
                    <span>{labelMeta.label}</span>
                  </Badge>
                )}
                {priorityMeta && (
                  <Badge variant="outline" className={cn("gap-1.5", priorityMeta.badgeClass)}>
                    {PriorityIcon && <PriorityIcon className="h-3.5 w-3.5" aria-hidden />}
                    <span>{priorityMeta.label}</span>
                  </Badge>
                )}
                {dueDateMeta && (
                  <Badge variant="outline" className={cn("gap-1.5", dueDateMeta.badgeClass)}>
                    <CalendarIcon className="h-3.5 w-3.5" aria-hidden />
                    <span>{dueDateMeta.label}</span>
                  </Badge>
                )}
              </div>
            </>
          )}
        </div>
      </div>

        <DialogFooter className="pt-4">
          {isEditing && (
            <div className="flex w-full flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button
                type="button"
                variant="destructive"
                className="w-full sm:w-auto"
                onClick={() => setDeleteConfirmOpen(true)}
                disabled={deleting}
              >
                <Trash2 className="mr-2 h-4 w-4" aria-hidden />
                Delete Task
              </Button>
              <Button type="submit" className="w-full sm:w-auto sm:ml-auto">
                <Save className="mr-2 h-4 w-4" aria-hidden />
                Save Changes
              </Button>
            </div>
          )}
        </DialogFooter>
      </form>

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete this task?</DialogTitle>
            <DialogDescription>
              This permanently removes the task and any related attachments. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleting}
            >
              <Trash2 className="mr-2 h-4 w-4" aria-hidden />
              {deleting ? "Deleting..." : "Delete Task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
