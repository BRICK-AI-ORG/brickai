export type Priority = "low" | "medium" | "high" | "urgent";

export const priorityOptions: { value: Priority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

export const priorityOrder: Record<Priority, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export const getPriorityColors = (p?: string) => {
  const pri = (p || "medium").toLowerCase() as Priority;
  switch (pri) {
    case "urgent":
      return { bg: "bg-red-100", text: "text-red-800", border: "border-red-300" };
    case "high":
      return { bg: "bg-orange-100", text: "text-orange-800", border: "border-orange-300" };
    case "medium":
      return { bg: "bg-amber-100", text: "text-amber-800", border: "border-amber-300" };
    case "low":
    default:
      return { bg: "bg-gray-100", text: "text-gray-800", border: "border-gray-300" };
  }
};

