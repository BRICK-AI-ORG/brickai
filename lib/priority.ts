export const PRIORITY_VALUES = ["urgent", "high", "medium", "low", "lowest"] as const;

export type Priority = (typeof PRIORITY_VALUES)[number];

const PRIORITY_LABELS: Record<Priority, string> = {
  urgent: "Urgent",
  high: "High",
  medium: "Medium",
  low: "Low",
  lowest: "Lowest",
};

export const priorityOptions: { value: Priority; label: string }[] = PRIORITY_VALUES.map(
  (value) => ({
    value,
    label: PRIORITY_LABELS[value],
  })
);

export const priorityOrder: Record<Priority, number> = PRIORITY_VALUES.reduce(
  (order, value, index) => {
    order[value] = index;
    return order;
  },
  {} as Record<Priority, number>
);

export const normalizePriority = (p?: string | null): Priority => {
  const raw = typeof p === "string" ? p.toLowerCase().trim() : "";
  return (PRIORITY_VALUES as readonly string[]).includes(raw)
    ? (raw as Priority)
    : "medium";
};

export const getPriorityColors = (p?: string) => {
  const pri = normalizePriority(p);
  switch (pri) {
    case "urgent":
      return { bg: "bg-rose-100", text: "text-rose-700", border: "border-rose-200" };
    case "high":
      return { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" };
    case "medium":
      return { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200" };
    case "low":
      return { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200" };
    case "lowest":
    default:
      return { bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-200" };
  }
};
