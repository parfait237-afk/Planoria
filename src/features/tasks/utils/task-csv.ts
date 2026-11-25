import type { PlanoriaData, Task } from "@/features/tasks/types/task";
import { getTaskRelations } from "@/features/tasks/domain/task-rules";
import { formatTaskDate } from "@/features/tasks/utils/task-dates";

function protectCsvCell(value: string) {
  const protectedValue = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${protectedValue.replaceAll('"', '""')}"`;
}

export function buildTasksCsv(data: PlanoriaData, tasks: Task[]) {
  const header = ["Tâche", "Projet", "Responsable", "Planifiée", "Échéance", "Statut", "Priorité", "Catégorie", "Récurrence"];
  const rows = tasks.map((task) => {
    const relation = getTaskRelations(data, task);
    return [task.title, relation.project?.name ?? "", relation.collaborator?.name ?? "", formatTaskDate(task.plannedDate, data.referenceDate), formatTaskDate(task.dueDate, data.referenceDate), task.status, task.priority, task.category, task.recurrence ?? "Aucune"].map(protectCsvCell).join(";");
  });
  return `\ufeff${header.map(protectCsvCell).join(";")}\r\n${rows.join("\r\n")}`;
}

export function downloadTasksCsv(data: PlanoriaData, tasks: Task[]) {
  const url = URL.createObjectURL(new Blob([buildTasksCsv(data, tasks)], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "planoria-taches.csv";
  link.click();
  URL.revokeObjectURL(url);
}

