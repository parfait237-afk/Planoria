import { isTaskOverdue } from "@/features/tasks/domain/task-rules";
import type { CollaboratorFormValues, PlanoriaData } from "@/features/tasks/types/task";

export function getCollaboratorStats(data: PlanoriaData, collaboratorId: string) {
  const tasks = data.tasks.filter((task) => task.collaboratorId === collaboratorId);
  return { total: tasks.length, completed: tasks.filter((task) => ["Terminée", "Validée"].includes(task.status)).length, overdue: tasks.filter(isTaskOverdue).length };
}

export function validateCollaborator(data: PlanoriaData, values: CollaboratorFormValues, editingId?: string) {
  const errors: Partial<Record<keyof CollaboratorFormValues, string>> = {};
  const name = values.name.trim().replace(/\s+/g, " "); const email = values.email.trim().toLocaleLowerCase("fr"); const role = values.role.trim();
  if (!name) errors.name = "Le nom complet est obligatoire.";
  else if (data.collaborators.some((person) => person.id !== editingId && person.name.trim().toLocaleLowerCase("fr") === name.toLocaleLowerCase("fr"))) errors.name = "Une fiche portant ce nom existe déjà.";
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Saisissez une adresse e-mail valide.";
  else if (email && data.collaborators.some((person) => person.id !== editingId && person.email?.toLocaleLowerCase("fr") === email)) errors.email = "Cette adresse e-mail est déjà utilisée.";
  return { errors, normalized: { name, email, role } };
}

export function initialsFromName(name: string) { return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "?"; }

