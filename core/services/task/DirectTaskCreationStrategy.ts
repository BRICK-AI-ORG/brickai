import { SupabaseClient } from "@supabase/supabase-js";
import { TaskEntity } from "@/core/domain/entities/TaskEntity";
import { TaskCreationInput, TaskCreationResult, TaskCreationStrategy } from "./TaskCreationStrategy";

export class DirectTaskCreationStrategy implements TaskCreationStrategy {
  public constructor(private readonly client: SupabaseClient) {}

  public canHandle(): boolean {
    return true;
  }

  public async execute(input: TaskCreationInput): Promise<TaskCreationResult> {
    const { data, error } = await this.client
      .from("tasks")
      .insert({
        title: input.title,
        description: input.description,
        completed: false,
        status: "todo",
        user_id: input.userId,
        portfolio_id: input.portfolioId ?? null,
      })
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return {
      task: TaskEntity.fromRecord(data),
      source: "direct",
    };
  }
}
