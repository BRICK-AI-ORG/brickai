export const labels = [
  { value: "maintenance", label: "Maintenance", "bg-color": "bg-yellow-100", "text-color": "text-yellow-800", "border-color": "border-yellow-300" },
  { value: "compliance",  label: "Compliance",  "bg-color": "bg-emerald-100","text-color": "text-emerald-800","border-color": "border-emerald-300" },
  { value: "finance",     label: "Finance",     "bg-color": "bg-blue-100",   "text-color": "text-blue-800",   "border-color": "border-blue-300" },
  { value: "admin",       label: "Admin",       "bg-color": "bg-gray-100",   "text-color": "text-gray-800",   "border-color": "border-gray-300" },
  { value: "lettings",    label: "Lettings",    "bg-color": "bg-indigo-100", "text-color": "text-indigo-800", "border-color": "border-indigo-300" },
  { value: "inspection",  label: "Inspection",  "bg-color": "bg-sky-100",    "text-color": "text-sky-800",    "border-color": "border-sky-300" },
  { value: "refurb",      label: "Refurb",      "bg-color": "bg-fuchsia-100","text-color": "text-fuchsia-800","border-color": "border-fuchsia-300" },
  { value: "legal",       label: "Legal",       "bg-color": "bg-red-100",    "text-color": "text-red-800",    "border-color": "border-red-300" },
  { value: "operations",  label: "Operations",  "bg-color": "bg-teal-100",   "text-color": "text-teal-800",   "border-color": "border-teal-300" },
  { value: "tenant",      label: "Tenant",      "bg-color": "bg-purple-100", "text-color": "text-purple-800", "border-color": "border-purple-300" },
  // legacy (kept for existing rows)
  { value: "work",        label: "Work",        "bg-color": "bg-blue-100",   "text-color": "text-blue-800",   "border-color": "border-blue-300" },
  { value: "personal",    label: "Personal",    "bg-color": "bg-green-100",  "text-color": "text-green-800",  "border-color": "border-green-300" },
  { value: "shopping",    label: "Shopping",    "bg-color": "bg-yellow-100", "text-color": "text-yellow-800", "border-color": "border-yellow-300" },
  { value: "home",        label: "Home",        "bg-color": "bg-purple-100", "text-color": "text-purple-800", "border-color": "border-purple-300" },
  { value: "priority",    label: "Priority",    "bg-color": "bg-red-100",    "text-color": "text-red-800",    "border-color": "border-red-300" },
] as const;

export type LabelType = (typeof labels)[number]["value"];

export const getLabelColors = (label: string) => {
  const labelObj = labels.find((l) => l.value === label);
  return {
    "bg-color": labelObj?.["bg-color"] || "bg-gray-500",
    "text-color": labelObj?.["text-color"] || "text-gray-500",
    "border-color": labelObj?.["border-color"] || "border-gray-500",
  };
};
