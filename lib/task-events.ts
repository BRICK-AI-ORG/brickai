import type { Task } from "@/types/models";

export const TASK_CREATED_EVENT = "brickai:task-created";
export const TASK_UPDATED_EVENT = "brickai:task-updated";
export const TASK_DELETED_EVENT = "brickai:task-deleted";

type TaskCreatedDetail = { task: Task };
type TaskUpdatedDetail = { task: Task; previousPortfolioId?: string | null };
type TaskDeletedDetail = { taskId: string; portfolioId?: string | null };

const getTarget = () => (typeof window === "undefined" ? null : window);

export function emitTaskCreated(task: Task) {
  const target = getTarget();
  if (!target) return;
  target.dispatchEvent(
    new CustomEvent<TaskCreatedDetail>(TASK_CREATED_EVENT, { detail: { task } })
  );
}

export function emitTaskUpdated(task: Task, previousPortfolioId?: string | null) {
  const target = getTarget();
  if (!target) return;
  target.dispatchEvent(
    new CustomEvent<TaskUpdatedDetail>(TASK_UPDATED_EVENT, {
      detail: { task, previousPortfolioId },
    })
  );
}

export function emitTaskDeleted(taskId: string, portfolioId?: string | null) {
  const target = getTarget();
  if (!target) return;
  target.dispatchEvent(
    new CustomEvent<TaskDeletedDetail>(TASK_DELETED_EVENT, {
      detail: { taskId, portfolioId: portfolioId ?? null },
    })
  );
}

export type { TaskCreatedDetail, TaskUpdatedDetail, TaskDeletedDetail };
