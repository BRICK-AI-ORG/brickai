import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DialogFooter } from "@/components/ui/dialog";
import { CalendarIcon, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { priorityAppearanceList } from "@/components/task-priority";
import { SuggestionTicker } from "@/components/SuggestionTicker";
import { labels, type LabelType } from "@/lib/labels";
import { labelIconMap } from "@/components/task-label-icons";

interface CreateTaskFormProps {
  onSubmit: (
    title: string,
    description: string,
    dueDate?: string | null,
    imageFiles?: File[] | null,
    priority?: string | null,
    label?: string | null
  ) => Promise<void>;
}

const SUGGESTIONS = [
  "Add contractor contact details and availability.",
  "Outline key milestones or inspection dates.",
  "Attach progress photos for quick context.",
  "Note any supplier dependencies or lead times.",
];

const MAX_IMAGES = 5;
const EDIT_SUGGESTION_LAYOUT_CLASS = "h-full rounded-md border border-muted-foreground/30 bg-background";

export function CreateTaskForm({ onSubmit }: CreateTaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [label, setLabel] = useState<string>("");
  const [priority, setPriority] = useState<string>("medium");
  const [dueDateObj, setDueDateObj] = useState<Date | undefined>(undefined);
  const [dueDateOpen, setDueDateOpen] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updatePreviewUrl = useCallback((files: File[]) => {
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return files[0] ? URL.createObjectURL(files[0]) : null;
    });
  }, []);

  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl]
  );

  const handleFileSelection = useCallback(
    (files: File[]) => {
      const limited = files.slice(0, MAX_IMAGES);
      setImageFiles(limited);
      updatePreviewUrl(limited);
    },
    [updatePreviewUrl]
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (!acceptedFiles.length) return;
      handleFileSelection(acceptedFiles);
    },
    [handleFileSelection]
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: { "image/jpeg": [], "image/png": [], "image/webp": [] },
    maxFiles: MAX_IMAGES,
    noClick: true,
    noKeyboard: true,
    multiple: true,
  });

  const dropzoneRootProps = getRootProps();
  const dropzoneInputProps = getInputProps();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError("Title is required.");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit(
        trimmedTitle,
        description.trim(),
        dueDateObj ? dueDateObj.toISOString() : null,
        imageFiles,
        priority,
        label || null
      );
      setTitle("");
      setDescription("");
      setLabel("");
      setPriority("medium");
      setDueDateObj(undefined);
      setDueDateOpen(false);
      handleFileSelection([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create task");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <div className="flex w-full flex-col items-start gap-2 sm:w-[260px]">
          <div
            {...dropzoneRootProps}
            className={cn(
              "relative aspect-[4/3] w-full overflow-hidden rounded-md border bg-muted/40",
              "cursor-pointer transition hover:border-primary/60",
              isDragActive && "border-primary/60 bg-primary/10"
            )}
          >
            <input {...dropzoneInputProps} />
            <Button
              type="button"
              size="icon"
              variant="secondary"
              className="absolute left-2 top-2 z-10 h-8 w-8 rounded-full border border-border/60 bg-background/90 text-foreground shadow-sm transition hover:bg-background disabled:opacity-60"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                open();
              }}
              disabled={isSubmitting}
            >
              <Plus className="h-4 w-4" aria-hidden />
              <span className="sr-only">Upload image</span>
            </Button>
            {previewUrl ? (
              <Image src={previewUrl} alt="Task preview" fill className="object-cover" unoptimized />
            ) : (
              <div className="flex h-full w-full items-center justify-center px-4 text-center text-sm text-muted-foreground">
                No image provided.
              </div>
            )}
          </div>
          {imageFiles.length > 1 && (
            <p className="text-xs text-muted-foreground">
              {imageFiles.length} attachments selected. The first image is used as the preview.
            </p>
          )}
        </div>

        <div className="flex-1 space-y-6">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
            className="text-lg font-semibold"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Textarea
                value={description}
                maxLength={100}
                rows={3}
                onChange={(e) => setDescription(e.target.value.slice(0, 100))}
                placeholder="Describe the work, expectations, and any additional notes."
                className="min-h-[120px] resize-none"
              />
              <div className="text-xs text-muted-foreground text-right">{description.length}/100</div>
            </div>
            <SuggestionTicker suggestions={SUGGESTIONS} layout="compact" className={EDIT_SUGGESTION_LAYOUT_CLASS} />
          </div>

          <div className="grid gap-3 pt-1 sm:grid-cols-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">Label</Label>
              <Select value={label} onValueChange={setLabel}>
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
              <Select value={priority} onValueChange={setPriority}>
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
              <Popover open={dueDateOpen} onOpenChange={setDueDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !dueDateObj && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDateObj ? format(dueDateObj, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDateObj}
                    onSelect={(next) => {
                      setDueDateObj(next ?? undefined);
                      if (next) setDueDateOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </div>

      <DialogFooter className="pt-4">
        <Button type="submit" className="w-full sm:w-auto sm:ml-auto" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Task"}
        </Button>
      </DialogFooter>
    </form>
  );
}

