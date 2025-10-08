import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";
import { getLabelColors } from "@/lib/labels";
import { Task } from "@/types/models";

interface TaskRowProps {
  task: Task;
  onDelete: (taskId: string) => void;
  onToggleComplete: (taskId: string, completed: boolean) => void;
  onEdit?: (taskId: string) => void;
}

const TaskRow = ({ task, onDelete, onToggleComplete, onEdit }: TaskRowProps) => {
  const formatDate = (dateString: string) => {
    return dateString.split("T")[0];
  };

  const isCompleted = !!task.completed;
  return (
    <TableRow className={["hover:bg-muted/50", isCompleted ? "opacity-60" : ""].join(" ")}>
      <TableCell className="py-2">
        <Checkbox
          checked={task.completed!}
          onCheckedChange={(checked) =>
            onToggleComplete(task.task_id, checked as boolean)
          }
        />
      </TableCell>
      <TableCell className="py-2">
        <button
          type="button"
          className={["hover:underline font-medium text-left", isCompleted ? "line-through" : ""].join(" ")}
          onClick={() => onEdit?.(task.task_id)}
        >
          {task.title}
        </button>
      </TableCell>
      <TableCell className="py-2">
        {task.label && (
          <Badge
            variant="outline"
            className={[
              getLabelColors(task.label)["bg-color"],
              getLabelColors(task.label)["text-color"],
              getLabelColors(task.label)["border-color"],
            ].join(" ")}
          >
            {task.label}
          </Badge>
        )}
      </TableCell>
      <TableCell className="py-2 whitespace-nowrap">
        {task.due_date ? formatDate(task.due_date) : ""}
      </TableCell>
      <TableCell className="text-right py-2">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit?.(task.task_id)}>
          <Edit className="h-4 w-4" />
          <span className="sr-only">Edit</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onDelete(task.task_id)}
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete</span>
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default TaskRow;
