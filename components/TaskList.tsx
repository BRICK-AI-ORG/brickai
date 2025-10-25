import TaskRow from "./TaskRow";
import { Task } from "@/types/models";
import { normalizePriority, priorityOrder } from "@/lib/priority";

interface TaskListProps {
  tasks: Task[];
  onSelect?: (taskId: string) => void;
}

const TaskList = ({ tasks, onSelect }: TaskListProps) => {
  const sorter = (a: Task, b: Task) => {
    // priority first: urgent > high > medium > low
    const ap = priorityOrder[normalizePriority(a.priority)] ?? 99;
    const bp = priorityOrder[normalizePriority(b.priority)] ?? 99;
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

  return (
    <TaskPanel
      title="Task Overview"
      subtitle={`${todos.length} active tasks`}
      emptyMessage="No outstanding tasks. Great job!"
      tasks={todos}
      onSelect={onSelect}
    />
  );
};

export default TaskList;

interface TaskPanelProps {
  title: string;
  subtitle?: string;
  emptyMessage: string;
  tasks: Task[];
  onSelect?: (taskId: string) => void;
}

function TaskPanel({ title, subtitle, emptyMessage, tasks, onSelect }: TaskPanelProps) {
  return (
    <section className="rounded-lg border border-border/40 bg-card/30 shadow-sm">
      <header className="flex items-center justify-between px-3 py-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{title}</span>
        {subtitle && <span className="text-[10px] text-muted-foreground/70">{subtitle}</span>}
      </header>
      <div className="border-t border-border/40" />
      {tasks.length === 0 ? (
        <div className="px-3 py-4 text-xs text-muted-foreground">{emptyMessage}</div>
      ) : (
        <div className="divide-y divide-border/30">
          {tasks.map((task) => (
            <TaskRow key={task.task_id} task={task} isCompleted={!!task.completed} onSelect={onSelect} />
          ))}
        </div>
      )}
    </section>
  );
}
