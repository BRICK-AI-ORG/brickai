"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, useNavigation } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout: captionLayoutProp,
  fromYear: fromYearProp,
  toYear: toYearProp,
  ...props
}: CalendarProps) {
  const now = new Date();
  const defaultFromYear = fromYearProp ?? 1900;
  const defaultToYear = toYearProp ?? now.getFullYear() + 10;
  const captionLayout = captionLayoutProp ?? "dropdown";

  // Custom caption with clean inline Month/Year selects (no extra labels)
  function Caption(cp: any) {
      const { goToMonth } = useNavigation();
      const displayMonth: Date = cp.displayMonth as Date;
      const month = displayMonth.getMonth();
      const year = displayMonth.getFullYear();
      const years: number[] = [];
      const today = new Date();
      // Detect if calendar is restricted to today or earlier via disabled matcher
      const disabledMatcher: any = (props as any)?.disabled;
      const isAfterTodayMatcher = (m: any): boolean => {
        if (!m) return false;
        if (Array.isArray(m)) return m.some(isAfterTodayMatcher);
        return typeof m === "object" && "after" in m && m.after;
      };
      const limitToToday = isAfterTodayMatcher(disabledMatcher);
      const capToYear = limitToToday ? Math.min(defaultToYear, today.getFullYear()) : defaultToYear;
      for (let y = defaultFromYear; y <= capToYear; y++) years.push(y);
      const monthFormatter = new Intl.DateTimeFormat(undefined, { month: "long" });
      const maxMonthIndex = limitToToday && year === today.getFullYear() ? today.getMonth() : 11;
      const months = Array.from({ length: maxMonthIndex + 1 }, (_, i) => monthFormatter.format(new Date(2020, i, 1)));
      return (
        <div className="flex items-center justify-center gap-2">
          <select
            aria-label="Month"
            className="h-8 rounded-md bg-background border border-input px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring scrollbox"
            value={Math.min(month, maxMonthIndex)}
            onChange={(e) => {
              const m = Number(e.target.value);
              const d = new Date(year, m, 1);
              goToMonth?.(d);
            }}
          >
            {months.map((m, idx) => (
              <option key={idx} value={idx}>
                {m}
              </option>
            ))}
          </select>
          <select
            aria-label="Year"
            className="h-8 rounded-md bg-background border border-input px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring scrollbox"
            value={year}
            onChange={(e) => {
              const y = Number(e.target.value);
              const cappedMonth = limitToToday && y === today.getFullYear() ? Math.min(month, today.getMonth()) : month;
              const d = new Date(y, cappedMonth, 1);
              goToMonth?.(d);
            }}
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      );
  }

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      captionLayout={captionLayout as any}
      fromYear={defaultFromYear as any}
      toYear={defaultToYear as any}
      className={cn(
        // Base padding + style dropdowns in dark UI
        "p-3 [&_.rdp-caption_dropdowns]:gap-2 [&_.rdp-dropdown]:bg-background [&_.rdp-dropdown]:text-foreground [&_.rdp-dropdown]:border [&_.rdp-dropdown]:border-input [&_.rdp-dropdown]:rounded-md [&_.rdp-dropdown]:h-8 [&_.rdp-dropdown]:px-2 [&_.rdp-dropdown]:focus:outline-none [&_.rdp-dropdown]:focus:ring-2 [&_.rdp-dropdown]:focus:ring-ring [&_.rdp-dropdown]:focus:border-ring",
        className
      )}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center gap-2",
        caption_label: "text-sm font-medium",
        // Ensure dropdown container spacing in case Tailwind descendant selectors miss
        caption_dropdowns: "flex items-center gap-2",
        dropdown:
          "bg-background text-foreground border border-input rounded-md h-8 px-2 focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring",
        dropdown_month: "",
        dropdown_year: "",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-range-end)]:rounded-r-md",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
            : "[&:has([aria-selected])]:rounded-md"
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_start: "day-range-start",
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        Caption,
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
