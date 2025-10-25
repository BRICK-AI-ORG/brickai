import { BaseService } from "./BaseService";
import { TaskImageEntity } from "@/core/domain/entities/TaskImageEntity";

const TASK_BUCKET = "task-attachments";

export class StorageService extends BaseService {
  public constructor(client: BaseService["client"]) {
    super(client);
  }

  public async createSignedUrl(path: string, durationSeconds = 60 * 60): Promise<string> {
    const { data, error } = await this.client.storage.from(TASK_BUCKET).createSignedUrl(path, durationSeconds);
    if (error) {
      throw error;
    }
    return data.signedUrl;
  }

  public async uploadTaskImage(entity: TaskImageEntity, file: File): Promise<void> {
    const { error } = await this.client.storage.from(TASK_BUCKET).upload(entity.getPath(), file, {
      upsert: false,
      contentType: file.type,
    });
    if (error) throw error;
  }

  public async removeTaskImage(path: string): Promise<void> {
    const { error } = await this.client.storage.from(TASK_BUCKET).remove([path]);
    if (error) throw error;
  }
}



