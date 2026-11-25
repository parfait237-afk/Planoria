import type { PlanoriaData, Task } from "@/features/tasks/types/task";
import type { ReportFilters } from "@/features/reports/types/report";
import { isTaskOverdue } from "@/features/tasks/domain/task-rules";

export function filterReportTasks(data: PlanoriaData, filters: ReportFilters) {
  return data.tasks.filter((task) => {
    return task.plannedDate >= filters.from && task.plannedDate <= filters.to && (!filters.projectId || task.projectId === filters.projectId) && (!filters.collaboratorId || task.collaboratorId === filters.collaboratorId);
  });
}

export function reportMetrics(tasks: Task[]) {
  const completed = tasks.filter((task) => ["Terminée", "Validée"].includes(task.status)).length;
  const validated = tasks.filter((task) => task.status === "Validée").length;
  const late = tasks.filter(isTaskOverdue).length;
  return { planned: tasks.length, completed, validated, late, completionRate: tasks.length ? Math.round(completed / tasks.length * 100) : 0 };
}

