import type { DashboardTask, DemoData } from "@/features/tasks/types/task";
import { formatTaskDate } from "@/features/tasks/utils/task-dates";
import { calendarDayDifference, calendarDate, monthBounds } from "@/lib/cameroon-date";

export type PeriodFilter = "today" | "week" | "month";
export type DashboardFilters = { period: PeriodFilter; projectId: string; collaboratorId: string; priority: string };

export const DEFAULT_FILTERS: DashboardFilters = { period: "week", projectId: "all", collaboratorId: "all", priority: "all" };
export const isRealized = (task: DashboardTask) => task.status === "Terminée" || task.status === "Validée";
export const isOverdue = (task: DashboardTask) => !isRealized(task) && task.overdue;

export function periodIncludes(offset: number, period: PeriodFilter, referenceDate: string) {
  if (period === "today") return offset === 0;
  if (period === "week") { const weekday = calendarDate(referenceDate).getUTCDay() || 7; return offset >= 1 - weekday && offset <= 7 - weekday; }
  const bounds = monthBounds(referenceDate);
  return offset >= calendarDayDifference(bounds.from, referenceDate) && offset <= calendarDayDifference(bounds.to, referenceDate);
}

export function filterTasks(tasks: DashboardTask[], filters: DashboardFilters, referenceDate: string) {
  return tasks.filter((task) =>
    periodIncludes(task.plannedOffset, filters.period, referenceDate) &&
    (filters.projectId === "all" || task.projectId === filters.projectId) &&
    (filters.collaboratorId === "all" || task.collaboratorId === filters.collaboratorId) &&
    (filters.priority === "all" || task.priority === filters.priority));
}

export function metrics(tasks: DashboardTask[], allTasks: DashboardTask[]) {
  const realized = tasks.filter(isRealized).length;
  return {
    today: allTasks.filter((task) => task.plannedOffset === 0).length,
    validated: tasks.filter((task) => task.status === "Validée").length,
    inProgress: tasks.filter((task) => task.status === "En cours").length,
    overdue: tasks.filter(isOverdue).length,
    paused: tasks.filter((task) => task.status === "En pause" || task.status === "Bloquée").length,
    realized,
    rate: tasks.length ? Math.round((realized / tasks.length) * 100) : 0,
    review: allTasks.filter((task) => task.status === "Terminée").length,
  };
}

export function distribution(tasks: DashboardTask[]) {
  return {
    realized: tasks.filter(isRealized).length,
    inProgress: tasks.filter((task) => task.status === "En cours").length,
    overdue: tasks.filter(isOverdue).length,
    remaining: tasks.filter((task) => !isRealized(task) && task.status !== "En cours" && !isOverdue(task)).length,
  };
}

export function formatDue(date: string, referenceDate: string) {
  return formatTaskDate(date, referenceDate);
}

export function taskRelations(data: DemoData, task: DashboardTask) {
  return {
    project: data.projects.find((project) => project.id === task.projectId),
    collaborator: data.collaborators.find((person) => person.id === task.collaboratorId),
  };
}
