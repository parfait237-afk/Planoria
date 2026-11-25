"use client";

import { useMemo, useState } from "react";
import type { PlanoriaData, Task } from "@/features/tasks/types/task";
import { offsetFromDate } from "@/features/planning/domain/planning-dates";
import type { PlanningFilters, PlanningView } from "@/features/planning/types/planning";
import { addCalendarDays, calendarDayDifference } from "@/lib/cameroon-date";

const initialFilters: PlanningFilters = { query: "", projectId: "all", collaboratorId: "all", priority: "all", status: "all", category: "all", dateFrom: "", dateTo: "", sort: "urgency" };
const priorityRank = { Urgente: 0, Normale: 1, Faible: 2 } as const;

export function usePlanning(data: PlanoriaData) {
  const [view, setView] = useState<PlanningView>("month");
  const [anchorOffset, setAnchorOffset] = useState(0);
  const [anchorReference, setAnchorReference] = useState(data.referenceDate);
  if (anchorReference !== data.referenceDate) {
    const selectedDate = addCalendarDays(anchorReference, anchorOffset);
    setAnchorReference(data.referenceDate);
    setAnchorOffset(anchorOffset === 0 ? 0 : calendarDayDifference(selectedDate, data.referenceDate));
  }
  const [filters, setFilters] = useState(initialFilters);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const tasks = useMemo(() => {
    const from = filters.dateFrom ? offsetFromDate(filters.dateFrom, data.referenceDate) : -Infinity;
    const to = filters.dateTo ? offsetFromDate(filters.dateTo, data.referenceDate) : Infinity;
    return data.tasks
      .filter((task) => task.title.toLocaleLowerCase("fr").includes(filters.query.toLocaleLowerCase("fr").trim()))
      .filter((task) => filters.projectId === "all" || task.projectId === filters.projectId)
      .filter((task) => filters.collaboratorId === "all" || task.collaboratorId === filters.collaboratorId)
      .filter((task) => filters.priority === "all" || task.priority === filters.priority)
      .filter((task) => filters.status === "all" || task.status === filters.status)
      .filter((task) => filters.category === "all" || task.category === filters.category)
      .filter((task) => task.plannedOffset >= from && task.plannedOffset <= to)
      .sort((a, b) => sortTasks(a, b, filters.sort, data));
  }, [data, filters]);

  const setFilter = <K extends keyof PlanningFilters>(key: K, value: PlanningFilters[K]) => setFilters((current) => ({ ...current, [key]: value }));
  return { view, setView, anchorOffset, setAnchorOffset, filters, setFilter, resetFilters: () => setFilters(initialFilters), advancedOpen, setAdvancedOpen, tasks };
}

function sortTasks(a: Task, b: Task, sort: PlanningFilters["sort"], data: PlanoriaData) {
  if (sort === "date") return a.plannedOffset - b.plannedOffset;
  if (sort === "project") return (data.projects.find((project) => project.id === a.projectId)?.name ?? "").localeCompare(data.projects.find((project) => project.id === b.projectId)?.name ?? "", "fr");
  return priorityRank[a.priority] - priorityRank[b.priority] || a.dueOffset - b.dueOffset;
}

