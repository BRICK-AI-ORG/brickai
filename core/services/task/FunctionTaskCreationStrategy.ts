import { TaskEntity } from "@/core/domain/entities/TaskEntity";
import { TaskCreationInput, TaskCreationResult, TaskCreationStrategy } from "./TaskCreationStrategy";

export class FunctionTaskCreationStrategy implements TaskCreationStrategy {
  public constructor(private readonly endpoint?: string) {}

  public canHandle(): boolean {
    return Boolean(this.endpoint);
  }

  public async execute(input: TaskCreationInput): Promise<TaskCreationResult> {
    if (!this.endpoint) {
      throw new Error("Function endpoint is not configured.");
    }

    const response = await fetch(this.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${input.accessToken}`,
      },
      body: JSON.stringify({
        title: input.title,
        description: input.description,
        portfolio_id: input.portfolioId ?? null,
      }),
    });

    if (!response.ok) {
      const message = await this.safeParseError(response);
      throw new Error(message);
    }

    const taskRecord = (await response.json()) as any;
    return {
      task: TaskEntity.fromRecord(taskRecord),
      source: "edge-function",
    };
  }

  private async safeParseError(response: Response): Promise<string> {
    try {
      const payload = await response.json();
      return payload?.error ?? payload?.message ?? "Failed to create task via edge function.";
    } catch {
      return "Failed to create task via edge function.";
    }
  }
}
