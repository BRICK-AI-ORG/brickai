import { TaskEntity } from "@/core/domain/entities/TaskEntity";

export interface TaskCreationInput {
  title: string;
  description: string;
  accessToken: string;
  userId: string;
  portfolioId?: string | null;
}

export interface TaskCreationResult {
  task: TaskEntity;
  source: "edge-function" | "direct";
}

export interface TaskCreationStrategy {
  canHandle(): boolean;
  execute(input: TaskCreationInput): Promise<TaskCreationResult>;
}
