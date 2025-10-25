import { Task, TaskImage } from "./models";
import { BaseState } from "./auth";

export interface TaskState extends BaseState {
  task: Task | null;
  date: Date | undefined;
  images?: TaskImage[];
  signedUrls?: Record<string, string>;
}

export interface TaskOperations {
  setDate: (date: Date | undefined) => void;
  updateTask: (updates: Partial<Task>) => void;
  saveTask: (taskToSave?: Task) => Promise<Task>;
  uploadImage: (file: File) => Promise<void>;
  removeImage: () => Promise<void>;
  uploadImages?: (files: File[]) => Promise<void>;
  listImages?: (taskId: string) => Promise<void>;
  removeImageById?: (imageId: string) => Promise<void>;
}

export interface TasksState extends BaseState {
  tasks: Task[];
}

export interface TasksOperations {
  createTask: (title: string, description: string) => Promise<Task>;
  deleteTask: (taskId: string) => Promise<void>;
  toggleTaskComplete: (taskId: string, completed: boolean) => Promise<void>;
  refreshTasks: () => Promise<void>;
}

export type UseTaskManagerReturn = TaskState &
  TasksState &
  TaskOperations &
  TasksOperations;
export type UseTaskReturn = TaskState & TaskOperations;
export type UseTasksReturn = TasksState & TasksOperations;
