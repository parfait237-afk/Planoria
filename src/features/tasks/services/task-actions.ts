import type { PlanoriaData, Task, TaskFormValues } from "@/features/tasks/types/task";
import { replacePlanoriaData } from "@/store/planoria-store";
import { decideTaskAction, saveTaskAction, updateTaskStatusesAction } from "@/app/actions/planoria-actions";

export async function saveTaskForm(data: PlanoriaData, values: TaskFormValues, editingId: string | null) {
  const project = data.projects.find((entry) => entry.name === values.project) ?? data.projects[0];
  const collaborator = data.collaborators.find((entry) => entry.name === values.collaborator) ?? data.collaborators[0];
  if (!project || !collaborator) throw new Error("Le projet ou le collaborateur sélectionné est introuvable.");
  const response = await saveTaskAction({ values, editingId, projectId: project.id, collaboratorId: collaborator.id });
  replacePlanoriaData(response.data);
}

export async function updateSelectedTaskStatus(selectedIds: Set<string>, status: "À faire" | "En cours" | "En pause") {
  const response = await updateTaskStatusesAction([...selectedIds], status); replacePlanoriaData(response.data); return { updated: response.updated, ignored: response.ignored };
}

export async function reopenValidatedTask(task: Task) {
  const response = await decideTaskAction(task.id, "reopened", "Rouverte afin de demander une nouvelle correction."); replacePlanoriaData(response.data);
}

export async function recordReviewDecision(task: Task, type: "validated" | "correction", reason: string) {
  const response = await decideTaskAction(task.id, type, reason); replacePlanoriaData(response.data);
}

export function taskToFormValues(data: PlanoriaData, task: Task): Partial<TaskFormValues> {
  const project = data.projects.find((entry) => entry.id === task.projectId);
  const collaborator = data.collaborators.find((entry) => entry.id === task.collaboratorId);
  return { title: task.title, description: task.description, project: project?.name ?? "", collaborator: collaborator?.name ?? "", plannedDate: task.plannedDate, dueDate: task.dueDate, deadlineTime: task.dueTime ?? "", priority: task.priority, category: task.category, status: task.status, startTime: task.startTime ?? "", endTime: task.endTime ?? "", estimatedMinutes: task.estimatedMinutes ? String(task.estimatedMinutes) : "", recurrence: task.recurrence ?? "Aucune", checklist: task.checklist ?? [] };
}
