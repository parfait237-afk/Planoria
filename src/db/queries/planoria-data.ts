import "server-only";

import { and, asc, eq, gte, isNull, lt } from "drizzle-orm";
import { db } from "@/db";
import { activityEvents, collaborators, projectMembers, projects, taskChecklistItems, taskDecisions, tasks, users } from "@/db/schema";
import type { PlanoriaData, ProjectColor, ProjectStatus, TaskPriority, TaskStatus } from "@/features/tasks/types/task";
import { calendarDayDifference, cameroonCalendarRange, cameroonDateKey, formatCameroonInstant, taskDueInstant } from "@/lib/cameroon-date";
import type { ActivityEvent } from "@/features/tasks/types/task";

const statusFromDb: Record<string, TaskStatus> = { todo: "À faire", in_progress: "En cours", paused: "En pause", blocked: "Bloquée", completed: "Terminée", validated: "Validée" };
const priorityFromDb: Record<string, TaskPriority> = { urgent: "Urgente", normal: "Normale", low: "Faible" };
const projectStatusFromDb: Record<string, ProjectStatus> = { to_plan: "À planifier", in_progress: "En cours", paused: "En pause", completed: "Terminé", archived: "Archivé" };
const colorFromDb: Record<string, ProjectColor> = { emerald: "Émeraude", blue: "Bleu", violet: "Violet", amber: "Ambre", coral: "Corail" };
const eventTypeFromDb = { creation: "Création", modification: "Modification", status: "Statut", validation: "Validation", correction: "Correction", comment: "Modification" } as const;
function recurrenceLabel(value: unknown) { if (!value || typeof value !== "object" || !("frequency" in value)) return "Aucune"; return ({ daily: "Quotidienne", weekly: "Hebdomadaire", monthly: "Mensuelle" } as Record<string, string>)[String(value.frequency)] ?? "Personnalisée"; }

export async function loadPlanoriaData(): Promise<PlanoriaData> {
  const now = new Date(); const referenceDate = cameroonDateKey(now); const referenceInstant = now.toISOString();
  const [people, projectRows, membershipRows, taskRows, checklistRows, decisionRows, eventRows, userRows] = await Promise.all([
    db.select().from(collaborators).where(isNull(collaborators.archivedAt)).orderBy(asc(collaborators.createdAt)), db.select().from(projects).where(isNull(projects.archivedAt)).orderBy(asc(projects.createdAt)), db.select().from(projectMembers), db.select().from(tasks).where(isNull(tasks.archivedAt)).orderBy(asc(tasks.createdAt)), db.select().from(taskChecklistItems).orderBy(asc(taskChecklistItems.position)), db.select().from(taskDecisions).orderBy(asc(taskDecisions.createdAt)), db.select().from(activityEvents).orderBy(asc(activityEvents.createdAt)), db.select().from(users).where(eq(users.active, true)),
  ]);
  const userNames = new Map(userRows.map((row) => [row.id, row.displayName]));
  return { version: 1, referenceDate, referenceInstant,
    collaborators: people.map((row) => ({ id: row.id, name: row.name, initials: row.initials, email: row.email ?? undefined, role: row.jobTitle ?? undefined, invitationDraft: row.invitationDraft ?? undefined })),
    projects: projectRows.map((row) => ({ id: row.id, name: row.name, description: row.description ?? undefined, ownerId: row.ownerId ?? undefined, memberIds: membershipRows.filter((member) => member.projectId === row.id).map((member) => member.collaboratorId), color: colorFromDb[row.color], status: projectStatusFromDb[row.status], startDate: row.startDate ?? undefined, targetDate: row.targetDate ?? undefined })),
    tasks: taskRows.map((row) => ({ id: row.id, title: row.title, description: row.instructions, projectId: row.projectId, collaboratorId: row.assigneeId, plannedDate: row.plannedDate, dueDate: row.dueDate, dueTime: row.dueTime?.slice(0, 5), overdue: !["completed", "validated"].includes(row.status) && now.getTime() >= taskDueInstant(row.dueDate, row.dueTime ?? undefined).getTime(), plannedOffset: calendarDayDifference(row.plannedDate, referenceDate), dueOffset: calendarDayDifference(row.dueDate, referenceDate), priority: priorityFromDb[row.priority], status: statusFromDb[row.status], category: row.category, startTime: row.startTime?.slice(0, 5), endTime: row.endTime?.slice(0, 5), estimatedMinutes: row.estimatedMinutes ?? undefined, correctionRequested: Boolean(row.correctionRequestedAt), correctionReason: row.correctionReason ?? undefined, recurrence: recurrenceLabel(row.recurrence), checklist: checklistRows.filter((item) => item.taskId === row.id).map((item) => ({ id: item.id, label: item.label, completed: Boolean(item.completedAt) })), validationHistory: decisionRows.filter((decision) => decision.taskId === row.id).map((decision) => ({ id: decision.id, type: decision.type, author: decision.authorUserId ? userNames.get(decision.authorUserId) ?? "Administrateur" : "Administrateur", date: formatCameroonInstant(decision.createdAt, { dateStyle: "long", timeStyle: "short" }), reason: decision.reason })) })),
    activities: eventRows.reverse().map((row) => ({ id: row.id, collaboratorId: row.collaboratorId ?? "", taskId: row.taskId ?? "", projectId: row.projectId ?? undefined, action: row.summary, time: formatCameroonInstant(row.createdAt), timestamp: row.createdAt.toISOString(), author: row.authorUserId ? userNames.get(row.authorUserId) : undefined, type: eventTypeFromDb[row.type], changes: (row.changes ?? []).map((change) => ({ field: change.field, before: String(change.before ?? ""), after: String(change.after ?? "") })) })),
  };
}

export async function loadActivityEventsBetween(from: string, toInclusive: string): Promise<ActivityEvent[]> {
  const { start, endExclusive } = cameroonCalendarRange(from, toInclusive);
  const [eventRows, userRows] = await Promise.all([
    db.select().from(activityEvents).where(and(gte(activityEvents.createdAt, start), lt(activityEvents.createdAt, endExclusive))).orderBy(asc(activityEvents.createdAt)),
    db.select().from(users).where(eq(users.active, true)),
  ]);
  const userNames = new Map(userRows.map((row) => [row.id, row.displayName]));
  return eventRows.reverse().map((row) => ({ id: row.id, collaboratorId: row.collaboratorId ?? "", taskId: row.taskId ?? "", projectId: row.projectId ?? undefined, action: row.summary, time: formatCameroonInstant(row.createdAt), timestamp: row.createdAt.toISOString(), author: row.authorUserId ? userNames.get(row.authorUserId) : undefined, type: eventTypeFromDb[row.type], changes: (row.changes ?? []).map((change) => ({ field: change.field, before: String(change.before ?? ""), after: String(change.after ?? "") })) }));
}
