import type { TaskPriority, TaskStatus } from "@/features/tasks/types/task";

export type PlanningView = "kanban" | "today" | "week" | "month" | "list";
export type PlanningSort = "urgency" | "date" | "project";
export type PlanningFilters = {
  query: string;
  projectId: string;
  collaboratorId: string;
  priority: TaskPriority | "all";
  status: TaskStatus | "all";
  category: string;
  dateFrom: string;
  dateTo: string;
  sort: PlanningSort;
};

