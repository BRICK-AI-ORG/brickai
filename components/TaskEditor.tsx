"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Save, Upload, CalendarIcon, Trash2, AlertOctagon, Sparkles } from "lucide-react";
import { labels } from "@/lib/labels";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useTaskManager } from "@/hooks/useTaskManager";
import { Task } from "@/types/models";
import { useToast } from "@/components/hooks/use-toast";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import { createBrowserClient } from "@supabase/ssr";

type TaskEditorProps = {
  taskId: string;
  onClose?: () => void;
};

export default function TaskEditor({ taskId, onClose }: TaskEditorProps) {
  const { task, date, setDate, updateTask, saveTask, uploadImage, removeImage, error, images, signedUrls, uploadImages, listImages, removeImageById } = useTaskManager(taskId) as any;
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [legacySignedUrl, setLegacySignedUrl] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleImageUpload = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    try {
      setUploading(true);
      if (uploadImages) {
        await uploadImages(acceptedFiles);
      } else {
        await uploadImage(file);
      }
      toast({ title: "Image Uploaded", description: "Image uploaded successfully" });
    } catch (e: any) {
      toast({ title: "Upload Failed", description: e.message || "Failed to upload image", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    (async () => {
      const path = task?.image_url;
      if (!path) {
        setLegacySignedUrl(null);
      } else {
        try {
          const { data, error } = await supabase.storage.from("task-attachments").createSignedUrl(path, 60 * 60);
          if (error) throw error;
          setLegacySignedUrl(data.signedUrl);
        } catch {
          setLegacySignedUrl(null);
        }
      }
      if (listImages && taskId) await listImages(taskId);
    })();
  }, [task?.image_url, supabase, taskId, listImages]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleImageUpload,
    accept: { "image/jpeg": [], "image/png": [] },
    maxFiles: Math.max(1, 5 - ((images?.length as number) || 0)),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveTask();
      toast({ title: "Task Updated", description: "Task updated successfully" });
      onClose?.();
    } catch {
      toast({ title: "Update Failed", description: "Failed to update task", variant: "destructive" });
    }
  };

  const handleRemoveImage = async () => {
    try {
      await removeImage();
      toast({ title: "Image Removed", description: "Image removed successfully" });
    } catch (e: any) {
      toast({ title: "Remove Failed", description: e.message || "Failed to remove image", variant: "destructive" });
    }
  };

  const handlePolish = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const resp = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/polish-task`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            task_id: task!.task_id,
            title: task!.title,
            description: task!.description,
          }),
        }
      );
      if (!resp.ok) throw new Error(`Polish failed (${resp.status})`);
      const updated = (await resp.json()) as Task;
      updateTask({ title: updated.title, description: updated.description });
      toast({ title: "Polished", description: "Title and description improved" });
    } catch (e: any) {
      toast({ title: "Polish Failed", description: e.message || String(e), variant: "destructive" });
    }
  };

  // legacy single-image renderer replaced by multi-image grid below

  const renderImageUpload = () => (
    <div
      {...getRootProps()}
      className={cn(
        "flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-md cursor-pointer",
        isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50"
      )}
    >
      <input {...getInputProps()} />
      <Upload className="h-6 w-6 text-gray-500" />
      {isDragActive ? (
        <p className="text-sm text-blue-500">Drop the image here...</p>
      ) : (
        <div className="space-y-1">
          <p className="text-sm text-gray-500">Drag and drop an image here, or click to select</p>
          <p className="text-xs text-gray-400">Supports: JPEG, PNG</p>
        </div>
      )}
    </div>
  );

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertOctagon className="mx-auto h-8 w-8 text-gray-500 mb-2" />
        <div className="text-gray-700 text-sm">{error}</div>
      </div>
    );
  }

  if (!task) return <div>Loading...</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid w-full items-center gap-1.5">
        <Label>Title</Label>
        <Input value={task.title || ""} onChange={(e) => updateTask({ title: e.target.value })} />
      </div>
      <div className="grid w-full items-center gap-1.5">
        <Label>Description</Label>
        <Textarea
          value={task.description || ""}
          maxLength={2000}
          onChange={(e) => updateTask({ description: e.target.value.slice(0, 2000) })}
        />
        <div className="text-xs text-muted-foreground mt-1 text-right">{(task.description || "").length}/2000</div>
        <div className="flex justify-end pt-1">
          <Button type="button" size="sm" variant="secondary" onClick={handlePolish}>
            <Sparkles className="mr-2 h-4 w-4" /> Polish with AI
          </Button>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox checked={task.completed || false} onCheckedChange={(checked) => updateTask({ completed: checked as boolean })} />
        <Label>Completed</Label>
      </div>
      <div className="grid w-full items-center gap-1.5">
        <Label>Label</Label>
        <Select value={task.label || ""} onValueChange={(value) => updateTask({ label: value as Task["label"] })}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a label" />
          </SelectTrigger>
          <SelectContent>
            {labels.filter((l) => l.value !== "priority").map((label) => (
              <SelectItem key={label.value} value={label.value}>
                {label.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid w-full items-center gap-1.5">
        <Label>Priority</Label>
        <Select
          value={task.priority || "medium"}
          onValueChange={(value) => updateTask({ priority: value as any })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="urgent"><span className="text-red-600 mr-2">🔥</span> Urgent</SelectItem>
            <SelectItem value="high"><span className="text-orange-600 mr-2">⚠️</span> High</SelectItem>
            <SelectItem value="medium"><span className="text-amber-600 mr-2">➖</span> Medium</SelectItem>
            <SelectItem value="low"><span className="text-gray-600 mr-2">💤</span> Low</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid w-full items-center gap-1.5">
        <Label>Due Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
          </PopoverContent>
        </Popover>
      </div>
      <div className="grid w-full items-center gap-1.5">
        <Label>Attach Images</Label>
        <div className="space-y-3">
          {/* Render legacy single image or new multi-image grid */}
          {images && images.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {images.map((img: any) => (
                <div key={img.image_id} className="relative w-full h-32 bg-gray-100 rounded-md overflow-hidden">
                  {signedUrls?.[img.image_id] ? (
                    <Image src={signedUrls[img.image_id]} alt="Task Image" fill className="object-contain" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-sm text-gray-500">Loading...</div>
                  )}
                  <div className="absolute top-1 right-1">
                    <Button type="button" size="icon" variant="outline" onClick={() => removeImageById?.(img.image_id)} className="h-7 w-7">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="relative w-full h-48 bg-gray-100 rounded-md overflow-hidden">
              {legacySignedUrl ? (
                <Image src={legacySignedUrl} alt="Task Image" fill className="object-contain" />
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-gray-500">No image available</div>
              )}
              {task?.image_url && (
                <div className="absolute bottom-2 right-2">
                  <Button type="button" size="sm" variant="outline" onClick={handleRemoveImage}>
                    <Trash2 className="mr-2 h-4 w-4" /> Remove Image
                  </Button>
                </div>
              )}
            </div>
          )}
          {(!images || images.length < 5) && renderImageUpload()}
          {images && (
            <div className="text-xs text-muted-foreground text-right">{(images?.length || 0)}/5 images</div>
          )}
        </div>
      </div>
      <div className="flex space-x-2 w-full pt-4">
        <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
          Close
        </Button>
        <Button type="submit" className="flex-1">
          <Save className="mr-2 h-4 w-4" /> Save Changes
        </Button>
      </div>
    </form>
  );
}


