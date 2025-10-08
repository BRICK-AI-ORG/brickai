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
import { Save, Upload, CalendarIcon, Trash2, AlertOctagon } from "lucide-react";
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
  const { task, date, setDate, updateTask, saveTask, uploadImage, removeImage, error } = useTaskManager(taskId);
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [signedImageUrl, setSignedImageUrl] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleImageUpload = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    try {
      setUploading(true);
      await uploadImage(file);
      toast({ title: "👍 Image Uploaded", description: "Image uploaded successfully" });
    } catch (e: any) {
      toast({ title: "⚠️ Upload Failed", description: e.message || "Failed to upload image", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    (async () => {
      const path = task?.image_url;
      if (!path) {
        setSignedImageUrl(null);
        return;
      }
      try {
        const { data, error } = await supabase.storage.from("task-attachments").createSignedUrl(path, 60 * 60);
        if (error) throw error;
        setSignedImageUrl(data.signedUrl);
      } catch {
        setSignedImageUrl(null);
      }
    })();
  }, [task?.image_url, supabase]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleImageUpload,
    accept: { "image/jpeg": [], "image/png": [] },
    maxFiles: 1,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveTask();
      toast({ title: "👍 Task Updated", description: "Task updated successfully" });
      onClose?.();
    } catch {
      toast({ title: "⚠️ Error", description: "Failed to update task", variant: "destructive" });
    }
  };

  const handleRemoveImage = async () => {
    try {
      await removeImage();
      toast({ title: "👍 Image Removed", description: "Image removed successfully" });
    } catch (e: any) {
      toast({ title: "⚠️ Remove Failed", description: e.message || "Failed to remove image", variant: "destructive" });
    }
  };

  const renderImageDisplay = () => {
    const signedUrl = signedImageUrl || null;
    return (
      <div className="space-y-2">
        <div className="relative w-full h-48 bg-gray-100 rounded-md overflow-hidden">
          {signedUrl ? (
            <Image src={signedUrl} alt="Task Image" fill className="object-contain" />
          ) : (
            <div className="flex items-center justify-center h-full text-sm text-gray-500">No image available</div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={handleRemoveImage}>
            <Trash2 className="mr-2 h-4 w-4" /> Remove Image
          </Button>
        </div>
      </div>
    );
  };

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
        <Textarea value={task.description || ""} onChange={(e) => updateTask({ description: e.target.value })} />
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
            {labels.map((label) => (
              <SelectItem key={label.value} value={label.value}>
                {label.label}
              </SelectItem>
            ))}
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
        <Label>Attach Image</Label>
        <div className="space-y-2">{task?.image_url ? renderImageDisplay() : renderImageUpload()}</div>
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
