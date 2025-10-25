import { BaseSupabaseRepository } from "./BaseSupabaseRepository";
import { TaskImageEntity } from "@/core/domain/entities/TaskImageEntity";
import { SupabaseClient } from "@supabase/supabase-js";
import { TaskImage } from "@/types/models";

export class TaskImageRepository extends BaseSupabaseRepository<TaskImageEntity> {
  constructor(client: SupabaseClient) {
    super(client, "task_images");
  }

  protected mapToEntity(record: TaskImage): TaskImageEntity {
    return TaskImageEntity.fromRecord(record);
  }

  protected mapFromEntity(entity: TaskImageEntity): Partial<TaskImage> {
    return entity.toRecord();
  }

  protected primaryKey(): string {
    return "image_id";
  }
}
