import { BaseService } from "./BaseService";
import { TaskRepository } from "@/core/repositories/TaskRepository";
import { TaskEntity, TaskEntityProps } from "@/core/domain/entities/TaskEntity";
import { TaskImageRepository } from "@/core/repositories/TaskImageRepository";
import { TaskImageEntity } from "@/core/domain/entities/TaskImageEntity";
import { StorageService } from "./StorageService";
import {
  DirectTaskCreationStrategy,
  FunctionTaskCreationStrategy,
  TaskCreationInput,
  TaskCreationResult,
  TaskCreationStrategy,
} from "./task";
import { RepositoryFindOptions } from "@/core/contracts/Repository";
import { Task, TaskImage } from "@/types/models";

const TASK_IMAGE_LIMIT = 5;
const MAX_FILE_SIZE = 1024 * 1024; // 1MB

export interface CreateTaskOptions {
  title: string;
  description: string;
  accessToken: string;
  userId: string;
  portfolioId?: string | null;
  dueDate?: Date | null;
  priority?: string | null;
  images?: File[] | null;
}

export interface UpdateTaskOptions {
  title?: string;
  description?: string | null;
  completed?: boolean;
  status?: TaskEntityProps["status"];
  label?: TaskEntityProps["label"];
  priority?: TaskEntityProps["priority"];
  dueDate?: Date | null;
  imageUrl?: string | null;
  portfolioId?: string | null;
}

export interface ImageResult {
  image: TaskImageEntity;
  signedUrl: string;
}

export class TaskService extends BaseService {
  private readonly taskRepository: TaskRepository;
  private readonly imageRepository: TaskImageRepository;
  private readonly storage: StorageService;
  private readonly creationStrategies: TaskCreationStrategy[];
  private readonly functionEndpoint: string | undefined;

  public constructor(client: BaseService["client"], storage = new StorageService(client)) {
    super(client);
    this.taskRepository = new TaskRepository(client);
    this.imageRepository = new TaskImageRepository(client);
    this.storage = storage;
    this.functionEndpoint = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-task-with-ai`;
    this.creationStrategies = [
      new FunctionTaskCreationStrategy(this.functionEndpoint),
      new DirectTaskCreationStrategy(client),
    ];
  }

  public async getTaskById(taskId: string): Promise<TaskEntity | null> {
    return this.taskRepository.findById(taskId);
  }

  public async getTaskWithImages(taskId: string): Promise<{ task: TaskEntity; images: ImageResult[] } | null> {
    const task = await this.getTaskById(taskId);
    if (!task) return null;
    const images = await this.listImages(taskId);
    return { task, images };
  }

  public async listTasksForUser(userId: string): Promise<TaskEntity[]> {
    const options: RepositoryFindOptions = {
      filters: { user_id: userId },
      orderBy: { column: "created_at", ascending: false },
    };
    return this.taskRepository.findAll(options);
  }

  public async listTasksForPortfolio(portfolioId: string): Promise<TaskEntity[]> {
    return this.taskRepository.findAll({
      filters: { portfolio_id: portfolioId },
      orderBy: { column: "created_at", ascending: false },
    });
  }

  public async saveTask(entity: TaskEntity): Promise<void> {
    await this.taskRepository.save(entity);
  }

  public async updateTask(entity: TaskEntity, updates: UpdateTaskOptions): Promise<TaskEntity> {
    const nextStatus =
      updates.completed !== undefined
        ? updates.completed
          ? ("done" as TaskEntityProps["status"])
          : updates.status ?? entity.getStatus() ?? ("todo" as TaskEntityProps["status"])
        : updates.status ?? entity.getStatus();

    entity.apply({
      title: updates.title ?? entity.getTitle(),
      description: updates.description ?? entity.getDescription(),
      completed: updates.completed ?? entity.isCompleted(),
      status: nextStatus,
      label: updates.label ?? entity.getLabel(),
      priority: updates.priority ?? entity.getPriority(),
      dueDate: updates.dueDate ?? entity.getDueDate(),
      imageUrl: updates.imageUrl ?? entity.getImageUrl(),
      portfolioId: updates.portfolioId ?? entity.getPortfolioId(),
    } as TaskEntityProps);

    await this.taskRepository.save(entity);
    return entity;
  }

  public async deleteTask(taskId: string): Promise<void> {
    const task = await this.getTaskById(taskId);
    if (!task) return;
    await this.taskRepository.delete(task);
  }

  public async toggleTaskCompletion(taskId: string, completed: boolean): Promise<TaskEntity | null> {
    const task = await this.getTaskById(taskId);
    if (!task) return null;
    await this.updateTask(task, { completed });
    return task;
  }

  public async createTask(options: CreateTaskOptions): Promise<TaskEntity> {
    const strategyInput: TaskCreationInput = {
      title: options.title,
      description: options.description,
      accessToken: options.accessToken,
      userId: options.userId,
      portfolioId: options.portfolioId ?? null,
    };

    let result: TaskCreationResult | null = null;
    for (const strategy of this.creationStrategies) {
      if (!strategy.canHandle()) continue;
      try {
        result = await strategy.execute(strategyInput);
        break;
      } catch (error) {
        if (strategy instanceof FunctionTaskCreationStrategy) {
          // swallow and try next strategy
          continue;
        }
        throw error;
      }
    }

    if (!result) {
      throw new Error("Unable to create task using any available strategy.");
    }

    const task = result.task;

    if (options.dueDate || options.priority) {
      task.setDueDate(options.dueDate ?? null);
      if (options.priority) {
        task.setPriority(options.priority as any);
      }
      await this.updateTask(task, {
        dueDate: options.dueDate ?? null,
        priority: (options.priority as any) ?? task.getPriority(),
      });
    }

    if (options.images && options.images.length > 0) {
      await this.attachImages(task, options.images);
    }

    return task;
  }

  public async attachImages(task: TaskEntity, files: File[]): Promise<ImageResult[]> {
    const existingImages = await this.imageRepository.findAll({
      filters: { task_id: task.getId() },
    });

    const availableSlots = TASK_IMAGE_LIMIT - existingImages.length;
    if (availableSlots <= 0) {
      throw new Error(`A maximum of ${TASK_IMAGE_LIMIT} images can be attached to a task.`);
    }

    const results: ImageResult[] = [];

    for (const file of files.slice(0, availableSlots)) {
      this.validateImage(file);
      const entity = this.createTaskImageEntity(task, file);
      await this.storage.uploadTaskImage(entity, file);
      await this.imageRepository.save(entity);
      const signedUrl = await this.storage.createSignedUrl(entity.getPath());
      results.push({ image: entity, signedUrl });
    }

    return results;
  }

  public async removeImage(imageId: string): Promise<void> {
    const image = await this.imageRepository.findById(imageId);
    if (!image) return;
    await this.storage.removeTaskImage(image.getPath());
    await this.imageRepository.delete(image);
  }

  public async removeLegacyImage(task: TaskEntity): Promise<TaskEntity> {
    if (!task.getImageUrl()) {
      return task;
    }

    await this.storage.removeTaskImage(task.getImageUrl()!);
    task.setImageUrl(null);
    await this.updateTask(task, { imageUrl: null });
    return task;
  }

  public async listImages(taskId: string): Promise<ImageResult[]> {
    const images = await this.imageRepository.findAll({
      filters: { task_id: taskId },
      orderBy: { column: "created_at", ascending: true },
    });

    const results: ImageResult[] = [];
    for (const image of images) {
      try {
        const signedUrl = await this.storage.createSignedUrl(image.getPath());
        results.push({ image, signedUrl });
      } catch {
        results.push({ image, signedUrl: "" });
      }
    }

    return results;
  }

  private validateImage(file: File): void {
    if (file.size > MAX_FILE_SIZE) {
      throw new Error("File size must be less than 1MB");
    }
    if (!file.type.startsWith("image/")) {
      throw new Error("Only image uploads are supported");
    }
  }

  private createTaskImageEntity(task: TaskEntity, file: File): TaskImageEntity {
    const extension = file.name.split(".").pop();
    const path = `${task.getUserId()}/${task.getId()}-${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;

    return TaskImageEntity.create({
      taskId: task.getId(),
      path,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  public toPlainTask(entity: TaskEntity): Task {
    return {
      task_id: entity.getId(),
      user_id: entity.getUserId(),
      title: entity.getTitle(),
      description: entity.getDescription(),
      completed: entity.isCompleted(),
      status: entity.getStatus(),
      label: entity.getLabel(),
      priority: entity.getPriority(),
      image_url: entity.getImageUrl(),
      portfolio_id: entity.getPortfolioId(),
      due_date: entity.getDueDate() ? entity.getDueDate()!.toISOString().split("T")[0] : null,
      created_at: entity.getCreatedAt()?.toISOString() ?? null,
      updated_at: entity.getUpdatedAt()?.toISOString() ?? null,
    } as Task;
  }

  public toPlainImage(entity: TaskImageEntity): TaskImage {
    return {
      image_id: entity.getId(),
      task_id: entity.getTaskId(),
      path: entity.getPath(),
      created_at: entity.getCreatedAt()?.toISOString() ?? null,
      updated_at: entity.getUpdatedAt()?.toISOString() ?? null,
    } as TaskImage;
  }
}
