import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import TaskRow from "./TaskRow";
import { Task } from "@/types/models";
import { priorityOrder, Priority } from "@/lib/priority";

interface TaskListProps {
  tasks: Task[];
  onDelete: (taskId: string) => Promise<void>;
  onToggleComplete: (taskId: string, completed: boolean) => Promise<void>;
  onEdit?: (taskId: string) => void;
}

const TaskList = ({ tasks, onDelete, onToggleComplete, onEdit }: TaskListProps) => {
  const sorter = (a: Task, b: Task) => {
    // priority first: urgent > high > medium > low
    const ap = priorityOrder[(a.priority?.toLowerCase() as Priority) || "medium"] ?? 99;
    const bp = priorityOrder[(b.priority?.toLowerCase() as Priority) || "medium"] ?? 99;
    if (ap !== bp) return ap - bp;
    // then due_date asc, nulls last
    const ad = a.due_date ? new Date(a.due_date).getTime() : Infinity;
    const bd = b.due_date ? new Date(b.due_date).getTime() : Infinity;
    if (ad !== bd) return ad - bd;
    // fallback: created_at desc
    const ac = a.created_at ? new Date(a.created_at).getTime() : 0;
    const bc = b.created_at ? new Date(b.created_at).getTime() : 0;
    return bc - ac;
  };
  const todos = tasks.filter((t) => !t.completed).sort(sorter);
  const done = tasks.filter((t) => !!t.completed).sort(sorter);
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="w-[50px] py-2"></TableHead>
          <TableHead className="py-2">Title</TableHead>
          <TableHead className="w-[110px] py-2">Priority</TableHead>
          <TableHead className="w-[100px] py-2">Label</TableHead>
          <TableHead className="w-[120px] py-2">Due Date</TableHead>
          <TableHead className="w-[100px] text-right py-2">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow className="hover:bg-transparent bg-muted/30">
          <td colSpan={6} className="py-2 text-[10px] uppercase tracking-wider text-muted-foreground">To Do:</td>
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
            <td colSpan={6} className="py-2 text-[10px] uppercase tracking-wider text-muted-foreground">Completed</td>
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
