import { BaseEntity, EntityProps } from "./BaseEntity";
import { TaskImage } from "@/types/models";
import { createUuid } from "@/core/utils/uuid";

export interface TaskImageEntityProps extends EntityProps {
  taskId: string;
  path: string;
}

export class TaskImageEntity extends BaseEntity<TaskImageEntityProps> {
  public static fromRecord(record: TaskImage): TaskImageEntity {
    return new TaskImageEntity(record.image_id, {
      taskId: record.task_id,
      path: record.path,
      createdAt: record.created_at ? new Date(record.created_at) : undefined,
    });
  }

  public static create(props: TaskImageEntityProps): TaskImageEntity {
    return new TaskImageEntity(createUuid(), props);
  }

  public getTaskId(): string {
    return this.props.taskId;
  }

  public getPath(): string {
    return this.props.path;
  }

  public toRecord(): Partial<TaskImage> {
    return {
      image_id: this.getId(),
      task_id: this.getTaskId(),
      path: this.getPath(),
    } as Partial<TaskImage>;
  }
}


