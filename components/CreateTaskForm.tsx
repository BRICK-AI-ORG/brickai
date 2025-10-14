import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";

interface CreateTaskFormProps {
  onSubmit: (
    title: string,
    description: string,
    dueDate?: string | null,
    imageFiles?: File[] | null,
    priority?: string | null
  ) => Promise<void>;
}

export function CreateTaskForm({ onSubmit }: CreateTaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<string>("");
  const [dueDateObj, setDueDateObj] = useState<Date | undefined>(undefined);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [priority, setPriority] = useState<string>("medium");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit(title, description, dueDate || null, imageFiles, priority);
      setTitle("");
      setDescription("");
      setDueDate("");
      setDueDateObj(undefined);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setImageFiles([]);
      setPreviewUrl(null);
      setPriority("medium");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create task");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter task title"
          required
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value.slice(0, 2000))}
          maxLength={2000}
          placeholder="Enter task description"
          rows={4}
        />
        <div className="text-xs text-muted-foreground mt-1 text-right">{description.length}/2000</div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <Label>Due Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className={cn(
                  "w-full h-9 justify-start text-left font-normal overflow-hidden",
                  !dueDateObj && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                <span className="truncate block max-w-full">
                  {dueDateObj ? format(dueDateObj, "PPP") : "Pick a date"}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="z-50 w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dueDateObj}
                onSelect={(d) => {
                  setDueDateObj(d ?? undefined);
                  setDueDate(d ? d.toISOString().slice(0, 10) : "");
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div>
          <Label htmlFor="image">Attach Image</Label>
          <Input
            id="image"
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(e) => {
              const files = Array.from(e.target.files || []).slice(0, 5);
              setImageFiles(files);
              if (previewUrl) URL.revokeObjectURL(previewUrl);
              setPreviewUrl(files[0] ? URL.createObjectURL(files[0]) : null);
            }}
          />
          {previewUrl && (
            <div className="mt-2 relative border rounded-md h-44 md:h-56 bg-muted overflow-hidden">
              <Image src={previewUrl} alt="Preview" fill className="object-contain" unoptimized />
            </div>
          )}
          {imageFiles.length > 1 && (
            <div className="text-xs text-muted-foreground mt-1">{imageFiles.length} files selected</div>
          )}
        </div>
        <div>
          <Label htmlFor="priority">Priority</Label>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger className="w-full h-9">
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="urgent">
                <span className="text-red-600 mr-2">🔥</span> Urgent
              </SelectItem>
              <SelectItem value="high">
                <span className="text-orange-600 mr-2">⚠️</span> High
              </SelectItem>
              <SelectItem value="medium">
                <span className="text-amber-600 mr-2">➖</span> Medium
              </SelectItem>
              <SelectItem value="low">
                <span className="text-gray-600 mr-2">💤</span> Low
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <style jsx>{`
        :global(textarea) {
          resize: vertical;
          max-height: 12rem;
        }
      `}</style>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creating..." : "Create Task"}
      </Button>
      {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
    </form>
  );
}

