import { BaseSupabaseRepository } from "./BaseSupabaseRepository";
import { TaskEntity } from "@/core/domain/entities/TaskEntity";
import { SupabaseClient } from "@supabase/supabase-js";
import { Task } from "@/types/models";

export class TaskRepository extends BaseSupabaseRepository<TaskEntity> {
  constructor(client: SupabaseClient) {
    super(client, "tasks");
  }

  protected mapToEntity(record: Task): TaskEntity {
    return TaskEntity.fromRecord(record);
  }

  protected mapFromEntity(entity: TaskEntity): Partial<Task> {
    return entity.toRecord();
  }
}
