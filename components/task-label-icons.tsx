import type { LucideIcon } from "lucide-react";
import {
  Wrench,
  ShieldCheck,
  PiggyBank,
  Briefcase,
  Key,
  ClipboardCheck,
  Hammer,
  Scale,
  Cog,
  Users,
  Flag,
} from "lucide-react";
import type { LabelType } from "@/lib/labels";

export const labelIconMap: Record<LabelType, LucideIcon | undefined> = {
  maintenance: Wrench,
  compliance: ShieldCheck,
  finance: PiggyBank,
  admin: Briefcase,
  lettings: Key,
  inspection: ClipboardCheck,
  refurb: Hammer,
  legal: Scale,
  operations: Cog,
  tenant: Users,
  priority: Flag,
};
