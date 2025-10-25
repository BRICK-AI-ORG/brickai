import { KeyboardEvent } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Task } from "@/types/models";
import { priorityAppearanceMap } from "@/components/task-priority";
import { getPriorityColors, normalizePriority, type Priority } from "@/lib/priority";

interface TaskRowProps {
  task: Task;
  isCompleted?: boolean;
  onSelect?: (taskId: string) => void;
}

const TaskRow = ({ task, isCompleted, onSelect }: TaskRowProps) => {
  const priorityAppearance =
    typeof task.priority === "string" && task.priority.trim()
      ? priorityAppearanceMap[normalizePriority(task.priority)]
      : undefined;

  const badgeBaseClass = "w-[108px] justify-center gap-1.5 text-[11px] font-medium leading-tight";
  const Icon = priorityAppearance?.Icon;

  const dueDateMeta = (() => {
    if (!task.due_date) return null;
    const dueDate = new Date(task.due_date);
    if (Number.isNaN(dueDate.getTime())) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffInDays = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    const duePriority: Priority =
      diffInDays < 0 ? "urgent" : diffInDays <= 7 ? "high" : diffInDays <= 14 ? "medium" : "low";

    const palette = getPriorityColors(duePriority);
    const sameYear = dueDate.getFullYear() === today.getFullYear();
    const dateLabel = format(dueDate, sameYear ? "dd MMM" : "dd MMM yyyy");
    const labelPrefix = diffInDays < 0 ? "Overdue" : "Due";

    return {
      label: `${labelPrefix} ${dateLabel}`,
      badgeClass: `${palette.bg} ${palette.text} ${palette.border}`,
      ariaLabel: `${labelPrefix} ${dateLabel}`,
    };
  })();

  const handleActivate = () => onSelect?.(task.task_id);
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleActivate();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleActivate}
      onKeyDown={handleKeyDown}
      className={[
        "group cursor-pointer px-3 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-ring/70 focus:ring-offset-2 focus:ring-offset-background",
        isCompleted ? "bg-muted/30" : "hover:bg-muted/20",
      ].join(" ")}
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3">
        <div className="min-w-0">
          <div
            className={[
              "truncate text-sm font-semibold text-foreground transition-colors group-hover:text-foreground/80",
              isCompleted ? "text-muted-foreground" : "",
            ].join(" ")}
          >
            {task.title || "Untitled task"}
          </div>
        </div>
        <div className="flex justify-end">
          {priorityAppearance ? (
            <Badge
              variant="outline"
              className={[priorityAppearance.badgeClass, badgeBaseClass].join(" ")}
            >
              {Icon && <Icon className="h-3 w-3" aria-hidden />}
              <span>{priorityAppearance.label}</span>
            </Badge>
          ) : (
            <Badge variant="outline" className={`${badgeBaseClass} invisible`} aria-hidden="true">
              &nbsp;
            </Badge>
          )}
        </div>
        <div className="flex justify-end">
          {dueDateMeta ? (
            <Badge
              variant="outline"
              className={[badgeBaseClass, dueDateMeta.badgeClass].join(" ")}
              aria-label={dueDateMeta.ariaLabel}
            >
              {dueDateMeta.label}
            </Badge>
          ) : (
            <Badge variant="outline" className={`${badgeBaseClass} invisible`} aria-hidden="true">
              &nbsp;
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskRow;
