import type { PlanoriaData, Task, TaskStatus } from "@/features/tasks/types/task";

export const isTaskRealized = (task: Task) => task.status === "Terminée" || task.status === "Validée";
export const isTaskOverdue = (task: Task) => !isTaskRealized(task) && task.overdue;
export const isTaskStatusProtected = (status: TaskStatus) => status === "Terminée" || status === "Validée";

export function getTaskRelations(data: PlanoriaData, task: Task) {
  return {
    project: data.projects.find((project) => project.id === task.projectId),
    collaborator: data.collaborators.find((person) => person.id === task.collaboratorId),
  };
}

export function applyBulkStatus(tasks: Task[], selectedIds: Set<string>, status: "À faire" | "En cours" | "En pause") {
  let updated = 0;
  let ignored = 0;
  const nextTasks = tasks.map((task) => {
    if (!selectedIds.has(task.id)) return task;
    if (isTaskStatusProtected(task.status)) { ignored += 1; return task; }
    updated += 1;
    return { ...task, status };
  });
  return { tasks: nextTasks, updated, ignored };
}

