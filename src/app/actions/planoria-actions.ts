"use server";

import { and, eq, inArray, isNull } from "drizzle-orm";
import { db } from "@/db";
import { activityEvents, collaborators, projectMembers, projects, taskChecklistItems, taskDecisions, tasks } from "@/db/schema";
import { loadActivityEventsBetween, loadPlanoriaData } from "@/db/queries/planoria-data";
import type { CollaboratorFormValues, ProjectFormValues, TaskFormValues, TaskStatus } from "@/features/tasks/types/task";
import { requireAdminActor as requireActor } from "@/server/auth/session";

const statusToDb = { "À faire": "todo", "En cours": "in_progress", "En pause": "paused", "Bloquée": "blocked", "Terminée": "completed", "Validée": "validated" } as const;
const priorityToDb = { Urgente: "urgent", Normale: "normal", Faible: "low" } as const;
const projectStatusToDb = { "À planifier": "to_plan", "En cours": "in_progress", "En pause": "paused", Terminé: "completed", Archivé: "archived" } as const;
const colorToDb = { Émeraude: "emerald", Bleu: "blue", Violet: "violet", Ambre: "amber", Corail: "coral" } as const;
const protectedStatuses = new Set(["completed", "validated"]);
function nonBlank(value: string, label: string) { const normalized = value.trim(); if (!normalized) throw new Error(`${label} est obligatoire.`); return normalized; }
function recurrence(value: string) { const frequency = ({ Quotidienne: "daily", Hebdomadaire: "weekly", Mensuelle: "monthly" } as const)[value as "Quotidienne" | "Hebdomadaire" | "Mensuelle"]; return frequency ? { frequency, interval: 1 } : null; }
function initials(name: string) { return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]!.toUpperCase()).join(""); }
async function result() { return { data: await loadPlanoriaData() }; }
export async function loadActivityHistoryAction(from: string, toInclusive: string) { await requireActor(); if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(toInclusive) || toInclusive < from) throw new Error("La période de l’historique est invalide."); return loadActivityEventsBetween(from, toInclusive); }

export async function saveTaskAction(input: { values: TaskFormValues; editingId: string | null; projectId: string; collaboratorId: string }) {
  const actor = await requireActor(); const { values } = input;
  const title = nonBlank(values.title, "Le titre");
  if (!values.plannedDate || !values.dueDate || values.dueDate < values.plannedDate) throw new Error("Les dates de la tâche sont invalides.");
  if (values.startTime && values.endTime && values.endTime <= values.startTime) throw new Error("L’heure de fin doit suivre l’heure de début.");
  await db.transaction(async (tx) => {
    const [project, person] = await Promise.all([tx.select({ id: projects.id }).from(projects).where(and(eq(projects.id, input.projectId), isNull(projects.archivedAt))).limit(1), tx.select({ id: collaborators.id }).from(collaborators).where(and(eq(collaborators.id, input.collaboratorId), isNull(collaborators.archivedAt))).limit(1)]);
    if (!project[0] || !person[0]) throw new Error("Le projet ou le collaborateur sélectionné n’existe plus.");
    let taskId = input.editingId;
    let before = "";
    if (taskId) {
      const [existing] = await tx.select().from(tasks).where(and(eq(tasks.id, taskId), isNull(tasks.archivedAt))).limit(1);
      if (!existing) throw new Error("La tâche n’existe plus.");
      before = existing.status;
      const requested = statusToDb[values.status as keyof typeof statusToDb] ?? existing.status;
      const status = protectedStatuses.has(existing.status) && requested !== existing.status ? existing.status : requested;
      await tx.update(tasks).set({ title, instructions: values.description.trim(), projectId: input.projectId, assigneeId: input.collaboratorId, category: nonBlank(values.category, "La catégorie"), priority: priorityToDb[values.priority], status, plannedDate: values.plannedDate, dueDate: values.dueDate, dueTime: values.deadlineTime || null, startTime: values.startTime || null, endTime: values.endTime || null, estimatedMinutes: values.estimatedMinutes ? Number(values.estimatedMinutes) : null, recurrence: recurrence(values.recurrence), updatedAt: new Date() }).where(eq(tasks.id, taskId));
      await tx.delete(taskChecklistItems).where(eq(taskChecklistItems.taskId, taskId));
    } else {
      const [created] = await tx.insert(tasks).values({ title, instructions: values.description.trim(), projectId: input.projectId, assigneeId: input.collaboratorId, category: nonBlank(values.category, "La catégorie"), priority: priorityToDb[values.priority], status: statusToDb[values.status as keyof typeof statusToDb] ?? "todo", plannedDate: values.plannedDate, dueDate: values.dueDate, dueTime: values.deadlineTime || null, startTime: values.startTime || null, endTime: values.endTime || null, estimatedMinutes: values.estimatedMinutes ? Number(values.estimatedMinutes) : null, recurrence: recurrence(values.recurrence) }).returning({ id: tasks.id }); taskId = created.id;
    }
    const checklist = values.checklist.filter((item) => item.label.trim()).map((item, position) => ({ taskId: taskId!, label: item.label.trim(), position, completedAt: item.completed ? new Date() : null }));
    if (checklist.length) await tx.insert(taskChecklistItems).values(checklist);
    await tx.insert(activityEvents).values({ type: input.editingId ? "modification" : "creation", taskId, projectId: input.projectId, collaboratorId: input.collaboratorId, authorUserId: actor.id, summary: input.editingId ? "Tâche modifiée" : "Tâche planifiée", changes: input.editingId && before ? [{ field: "Statut", before, after: statusToDb[values.status as keyof typeof statusToDb] ?? before }] : [] });
  });
  return result();
}

export async function updateTaskStatusesAction(ids: string[], status: "À faire" | "En cours" | "En pause") {
  const actor = await requireActor(); if (!ids.length) return { ...(await result()), updated: 0, ignored: 0 };
  const rows = await db.select({ id: tasks.id, status: tasks.status, projectId: tasks.projectId, assigneeId: tasks.assigneeId }).from(tasks).where(inArray(tasks.id, ids));
  const allowed = rows.filter((row) => !protectedStatuses.has(row.status));
  await db.transaction(async (tx) => { if (allowed.length) await tx.update(tasks).set({ status: statusToDb[status], updatedAt: new Date() }).where(inArray(tasks.id, allowed.map((row) => row.id))); for (const row of allowed) await tx.insert(activityEvents).values({ type: "status", taskId: row.id, projectId: row.projectId, collaboratorId: row.assigneeId, authorUserId: actor.id, summary: `Statut modifié : ${status}`, changes: [{ field: "Statut", before: row.status, after: statusToDb[status] }] }); });
  return { ...(await result()), updated: allowed.length, ignored: rows.length - allowed.length };
}

export async function decideTaskAction(taskId: string, type: "validated" | "correction" | "reopened", reason: string) {
  const actor = await requireActor(); const normalizedReason = nonBlank(reason, "Le motif");
  await db.transaction(async (tx) => { const [task] = await tx.select().from(tasks).where(eq(tasks.id, taskId)).limit(1); if (!task) throw new Error("La tâche n’existe plus."); const status = type === "validated" ? "validated" : "todo"; await tx.insert(taskDecisions).values({ taskId, authorUserId: actor.id, type, reason: normalizedReason }); await tx.update(tasks).set({ status, validatedAt: type === "validated" ? new Date() : null, correctionRequestedAt: type === "validated" ? null : new Date(), correctionReason: type === "validated" ? null : normalizedReason, updatedAt: new Date() }).where(eq(tasks.id, taskId)); await tx.insert(activityEvents).values({ type: type === "validated" ? "validation" : "correction", taskId, projectId: task.projectId, collaboratorId: task.assigneeId, authorUserId: actor.id, summary: type === "validated" ? "Tâche validée" : type === "reopened" ? "Tâche rouverte" : "Correction demandée", changes: [{ field: "Statut", before: task.status, after: status }] }); });
  return result();
}

export async function saveProjectAction(values: ProjectFormValues, editingId?: string) {
  await requireActor(); const name = nonBlank(values.name, "Le nom du projet"); if (values.startDate && values.targetDate && values.targetDate < values.startDate) throw new Error("La date cible doit suivre la date de début.");
  await db.transaction(async (tx) => { let id = editingId; const payload = { name, description: values.description.trim() || null, ownerId: values.ownerId || null, color: colorToDb[values.color], status: projectStatusToDb[values.status], startDate: values.startDate || null, targetDate: values.targetDate || null, updatedAt: new Date() }; if (id) { const changed = await tx.update(projects).set(payload).where(eq(projects.id, id)).returning({ id: projects.id }); if (!changed.length) throw new Error("Le projet n’existe plus."); await tx.delete(projectMembers).where(eq(projectMembers.projectId, id)); } else { const [created] = await tx.insert(projects).values(payload).returning({ id: projects.id }); id = created.id; } const memberIds = [...new Set([values.ownerId, ...values.memberIds].filter(Boolean))]; if (memberIds.length) await tx.insert(projectMembers).values(memberIds.map((collaboratorId) => ({ projectId: id!, collaboratorId }))); }); return result();
}

export async function saveCollaboratorAction(values: CollaboratorFormValues, editingId?: string) { await requireActor(); const name = nonBlank(values.name, "Le nom"); const payload = { name, initials: initials(name), email: values.email.trim() || null, jobTitle: values.role.trim() || null, updatedAt: new Date() }; if (editingId) { const changed = await db.update(collaborators).set(payload).where(eq(collaborators.id, editingId)).returning({ id: collaborators.id }); if (!changed.length) throw new Error("Le collaborateur n’existe plus."); } else await db.insert(collaborators).values(payload); return result(); }
export async function saveInvitationDraftAction(collaboratorId: string, message: string) { await requireActor(); const changed = await db.update(collaborators).set({ invitationDraft: message.trim(), updatedAt: new Date() }).where(eq(collaborators.id, collaboratorId)).returning({ id: collaborators.id }); if (!changed.length) throw new Error("Le collaborateur n’existe plus."); return result(); }
export async function moveTaskAction(taskId: string, status: TaskStatus) {
  const actor = await requireActor();
  if (status === "Validée") throw new Error("Une tâche doit être validée depuis le contrôle des réalisations.");
  await db.transaction(async (tx) => {
    const [task] = await tx.select().from(tasks).where(eq(tasks.id, taskId)).limit(1);
    if (!task) throw new Error("La tâche n’existe plus.");
    if (protectedStatuses.has(task.status)) throw new Error("Une tâche terminée ou validée ne peut pas être déplacée.");
    const target = statusToDb[status];
    await tx.update(tasks).set({ status: target, completedAt: target === "completed" ? new Date() : null, updatedAt: new Date() }).where(eq(tasks.id, taskId));
    await tx.insert(activityEvents).values({ type: "status", taskId, projectId: task.projectId, collaboratorId: task.assigneeId, authorUserId: actor.id, summary: `Statut modifié : ${status}`, changes: [{ field: "Statut", before: task.status, after: target }] });
  });
  return result();
}
