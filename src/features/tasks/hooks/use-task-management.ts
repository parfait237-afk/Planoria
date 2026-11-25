"use client";

import { useMemo, useState } from "react";
import type { PlanoriaData, Task, TaskStatus } from "@/features/tasks/types/task";
import { getTaskRelations, isTaskOverdue } from "@/features/tasks/domain/task-rules";

export const TASK_PAGE_SIZE = 8;
export type TaskStatusFilter = "all" | TaskStatus | "En retard";
export type TaskSortKey = "title" | "project" | "planned" | "due";
export type TaskSortDirection = "asc" | "desc";
export type TaskFiltersState = { status: TaskStatusFilter; projectId: string; collaboratorId: string; priority: string; search: string };
export const DEFAULT_TASK_FILTERS: TaskFiltersState = { status: "all", projectId: "all", collaboratorId: "all", priority: "all", search: "" };

export function useTaskManagement(data: PlanoriaData) {
  const [filters, setFiltersState] = useState<TaskFiltersState>(DEFAULT_TASK_FILTERS);
  const [sortKey, setSortKey] = useState<TaskSortKey>("due");
  const [sortDirection, setSortDirection] = useState<TaskSortDirection>("asc");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filteredTasks = useMemo(() => filterAndSortTasks(data, filters, sortKey, sortDirection), [data, filters, sortDirection, sortKey]);
  const pageCount = Math.max(1, Math.ceil(filteredTasks.length / TASK_PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageTasks = filteredTasks.slice((safePage - 1) * TASK_PAGE_SIZE, safePage * TASK_PAGE_SIZE);
  const pageSelected = pageTasks.filter((task) => selectedIds.has(task.id)).length;

  const setFilter = <K extends keyof TaskFiltersState>(key: K, value: TaskFiltersState[K]) => {
    setFiltersState((current) => ({ ...current, [key]: value }));
    setPage(1);
  };
  const resetFilters = () => { setFiltersState(DEFAULT_TASK_FILTERS); setPage(1); };
  const toggleSort = (key: TaskSortKey) => {
    if (sortKey === key) setSortDirection((current) => current === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDirection("asc"); }
    setPage(1);
  };
  const toggleSelection = (id: string) => setSelectedIds((current) => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  const togglePageSelection = () => setSelectedIds((current) => { const next = new Set(current); const select = pageSelected !== pageTasks.length; pageTasks.forEach((task) => select ? next.add(task.id) : next.delete(task.id)); return next; });

  return { filters, setFilter, resetFilters, sortKey, sortDirection, toggleSort, page: safePage, setPage, pageCount, filteredTasks, pageTasks, selectedIds, clearSelection: () => setSelectedIds(new Set()), toggleSelection, togglePageSelection, pageSelected };
}

function filterAndSortTasks(data: PlanoriaData, filters: TaskFiltersState, sortKey: TaskSortKey, direction: TaskSortDirection) {
  const normalizedSearch = filters.search.trim().toLocaleLowerCase("fr");
  const tasks = data.tasks.filter((task) => {
    const relation = getTaskRelations(data, task);
    const searchable = `${task.title} ${task.description} ${task.category} ${relation.project?.name ?? ""} ${relation.collaborator?.name ?? ""}`.toLocaleLowerCase("fr");
    return (filters.status === "all" || (filters.status === "En retard" ? isTaskOverdue(task) : task.status === filters.status)) &&
      (filters.projectId === "all" || task.projectId === filters.projectId) &&
      (filters.collaboratorId === "all" || task.collaboratorId === filters.collaboratorId) &&
      (filters.priority === "all" || task.priority === filters.priority) && (!normalizedSearch || searchable.includes(normalizedSearch));
  });
  return [...tasks].sort((left, right) => compareTasks(data, left, right, sortKey) * (direction === "asc" ? 1 : -1));
}

function compareTasks(data: PlanoriaData, left: Task, right: Task, key: TaskSortKey) {
  if (key === "planned") return left.plannedOffset - right.plannedOffset;
  if (key === "due") return left.dueOffset - right.dueOffset;
  const leftValue = key === "title" ? left.title : getTaskRelations(data, left).project?.name ?? "";
  const rightValue = key === "title" ? right.title : getTaskRelations(data, right).project?.name ?? "";
  return leftValue.localeCompare(rightValue, "fr");
}
