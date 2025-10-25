import { BaseEntity, EntityProps } from "./BaseEntity";
import { Identifier } from "@/core/domain/valueObjects/Identifier";
import { Task } from "@/types/models";
import { createUuid } from "@/core/utils/uuid";

export interface TaskEntityProps extends EntityProps {
  userId: string;
  title: string;
  description: string | null;
  completed: boolean;
  status: Task["status"];
  label: Task["label"];
  priority: Task["priority"];
  dueDate: Date | null;
  imageUrl: string | null;
  portfolioId: string | null;
}

export class TaskEntity extends BaseEntity<TaskEntityProps> {
  public static fromRecord(record: Task): TaskEntity {
    return new TaskEntity(record.task_id, {
      userId: record.user_id,
      title: record.title,
      description: record.description,
      completed: record.completed ?? false,
      status: record.status ?? "todo",
      label: record.label ?? null,
      priority: (record as any).priority ?? "medium",
      dueDate: record.due_date ? new Date(record.due_date) : null,
      imageUrl: record.image_url ?? null,
      portfolioId: (record as any).portfolio_id ?? null,
      createdAt: record.created_at ? new Date(record.created_at) : undefined,
      updatedAt: record.updated_at ? new Date(record.updated_at) : undefined,
    });
  }

  public static create(props: TaskEntityProps, id?: Identifier): TaskEntity {
    return new TaskEntity(id ? id.getValue() : createUuid(), props);
  }

  public getTitle(): string {
    return this.props.title;
  }

  public updateTitle(title: string): void {
    this.setProps({ ...this.props, title });
  }

  public getDescription(): string | null {
    return this.props.description;
  }

  public updateDescription(description: string | null): void {
    this.setProps({ ...this.props, description });
  }

  public isCompleted(): boolean {
    return this.props.completed;
  }

  public markCompleted(completed: boolean): void {
    this.setProps({ ...this.props, completed });
  }

  public getStatus(): Task["status"] {
    return this.props.status;
  }

  public setStatus(status: Task["status"]): void {
    this.setProps({ ...this.props, status });
  }

  public getLabel(): Task["label"] {
    return this.props.label;
  }

  public setLabel(label: Task["label"]): void {
    this.setProps({ ...this.props, label });
  }

  public getPriority(): Task["priority"] {
    return this.props.priority;
  }

  public setPriority(priority: Task["priority"]): void {
    this.setProps({ ...this.props, priority });
  }

  public getDueDate(): Date | null {
    return this.props.dueDate;
  }

  public setDueDate(dueDate: Date | null): void {
    this.setProps({ ...this.props, dueDate });
  }

  public getImageUrl(): string | null {
    return this.props.imageUrl;
  }

  public setImageUrl(imageUrl: string | null): void {
    this.setProps({ ...this.props, imageUrl });
  }

  public getPortfolioId(): string | null {
    return this.props.portfolioId;
  }

  public setPortfolioId(portfolioId: string | null): void {
    this.setProps({ ...this.props, portfolioId });
  }

  public getUserId(): string {
    return this.props.userId;
  }

  public apply(updates: Partial<TaskEntityProps>): void {
    this.setProps({ ...this.props, ...updates });
  }

  public toRecord(): Partial<Task> {
    return {
      task_id: this.getId(),
      user_id: this.props.userId,
      title: this.props.title,
      description: this.props.description,
      status: this.props.status,
      completed: this.props.completed,
      label: this.props.label,
      priority: this.props.priority,
      image_url: this.props.imageUrl,
      portfolio_id: this.props.portfolioId,
      due_date: this.props.dueDate ? this.props.dueDate.toISOString().split("T")[0] : null,
      updated_at: new Date().toISOString(),
    } as Task;
  }
}
