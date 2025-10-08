import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import TaskRow from "./TaskRow";
import { Task } from "@/types/models";

interface TaskListProps {
  tasks: Task[];
  onDelete: (taskId: string) => Promise<void>;
  onToggleComplete: (taskId: string, completed: boolean) => Promise<void>;
  onEdit?: (taskId: string) => void;
}

const TaskList = ({ tasks, onDelete, onToggleComplete, onEdit }: TaskListProps) => {
  const todos = tasks.filter((t) => !t.completed);
  const done = tasks.filter((t) => !!t.completed);
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="w-[50px] py-2"></TableHead>
          <TableHead className="py-2">Title</TableHead>
          <TableHead className="w-[100px] py-2">Label</TableHead>
          <TableHead className="w-[120px] py-2">Due Date</TableHead>
          <TableHead className="w-[100px] text-right py-2">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow className="hover:bg-transparent bg-muted/30">
          <td colSpan={5} className="py-2 text-[10px] uppercase tracking-wider text-muted-foreground">To Do:</td>
        </TableRow>
        {todos.map((task) => (
          <TaskRow
            key={task.task_id}
            task={task}
            onDelete={onDelete}
            onToggleComplete={onToggleComplete}
            onEdit={onEdit}
          />
        ))}
        {done.length > 0 && (
          <TableRow className="hover:bg-transparent bg-muted/30">
            <td colSpan={5} className="py-2 text-[10px] uppercase tracking-wider text-muted-foreground">Completed</td>
          </TableRow>
        )}
        {done.map((task) => (
          <TaskRow
            key={task.task_id}
            task={task}
            onDelete={onDelete}
            onToggleComplete={onToggleComplete}
            onEdit={onEdit}
          />
        ))}
      </TableBody>
    </Table>
  );
};

export default TaskList;
