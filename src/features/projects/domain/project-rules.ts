import type { PlanoriaData, Project, ProjectFormValues } from "@/features/tasks/types/task";

export function getProjectProgress(data: PlanoriaData, projectId: string) {
  const tasks = data.tasks.filter((task) => task.projectId === projectId);
  const completed = tasks.filter((task) => task.status === "Terminée" || task.status === "Validée").length;
  return { completed, total: tasks.length, percent: tasks.length ? Math.round(completed / tasks.length * 100) : 0 };
}

export function validateProject(data: PlanoriaData, values: ProjectFormValues, editingId?: string) {
  const errors: Partial<Record<keyof ProjectFormValues, string>> = {};
  const name = values.name.trim().replace(/\s+/g, " ");
  if (!name) errors.name = "Le nom du projet est obligatoire.";
  else if (data.projects.some((project) => project.id !== editingId && project.name.trim().toLocaleLowerCase("fr") === name.toLocaleLowerCase("fr"))) errors.name = "Un projet portant ce nom existe déjà.";
  if (values.startDate && values.targetDate && values.targetDate < values.startDate) errors.targetDate = "La date de fin doit être égale ou postérieure à la date de début.";
  return { errors, normalized: { ...values, name, description: values.description.trim(), memberIds: values.ownerId ? Array.from(new Set([...values.memberIds, values.ownerId])) : values.memberIds } };
}

export function projectToFormValues(project: Project): ProjectFormValues {
  return { name: project.name, description: project.description ?? "", ownerId: project.ownerId ?? "", memberIds: project.memberIds ?? [], color: project.color ?? "Émeraude", status: project.status ?? "À planifier", startDate: project.startDate ?? "", targetDate: project.targetDate ?? "" };
}

