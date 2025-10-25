import type { LucideIcon } from "lucide-react";
import { ChevronDown, ChevronUp, ChevronsDown, ChevronsUp, Equal } from "lucide-react";

import type { Priority } from "@/lib/priority";
import { getPriorityColors, priorityOptions } from "@/lib/priority";

type PriorityAppearance = {
  value: Priority;
  label: string;
  Icon: LucideIcon;
  iconClass: string;
  badgeClass: string;
};

const iconByPriority: Record<Priority, LucideIcon> = {
  urgent: ChevronsUp,
  high: ChevronUp,
  medium: Equal,
  low: ChevronDown,
  lowest: ChevronsDown,
};

export const priorityAppearanceMap: Record<Priority, PriorityAppearance> =
  priorityOptions.reduce((acc, option) => {
    const colors = getPriorityColors(option.value);
    acc[option.value] = {
      value: option.value,
      label: option.label,
      Icon: iconByPriority[option.value],
      iconClass: colors.text,
      badgeClass: `${colors.bg} ${colors.text} ${colors.border}`,
    };
    return acc;
  }, {} as Record<Priority, PriorityAppearance>);

export const priorityAppearanceList = priorityOptions.map(
  (option) => priorityAppearanceMap[option.value]
);
