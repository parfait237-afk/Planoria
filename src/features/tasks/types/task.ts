export const TASK_STATUSES = ["À faire", "En cours", "En pause", "Bloquée", "Terminée", "Validée"] as const;
export const TASK_PRIORITIES = ["Urgente", "Normale", "Faible"] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];
export type TaskPriority = (typeof TASK_PRIORITIES)[number];
export type TaskChecklistItem = { id: string; label: string; completed: boolean };

export type ValidationDecision = {
  id: string;
  type: "validated" | "correction" | "reopened";
  author: string;
  date: string;
  reason: string;
};

export type Collaborator = {
  id: string;
  name: string;
  initials: string;
  email?: string;
  role?: string;
  invitationDraft?: string;
};
export type CollaboratorFormValues = { name: string; email: string; role: string };
export const PROJECT_STATUSES = ["À planifier", "En cours", "En pause", "Terminé", "Archivé"] as const;
export const PROJECT_COLORS = ["Émeraude", "Bleu", "Violet", "Ambre", "Corail"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];
export type ProjectColor = (typeof PROJECT_COLORS)[number];
export type Project = {
  id: string;
  name: string;
  description?: string;
  ownerId?: string;
  memberIds?: string[];
  color?: ProjectColor;
  status?: ProjectStatus;
  startDate?: string;
  targetDate?: string;
};

export type ProjectFormValues = {
  name: string;
  description: string;
  ownerId: string;
  memberIds: string[];
  color: ProjectColor;
  status: ProjectStatus;
  startDate: string;
  targetDate: string;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  projectId: string;
  collaboratorId: string;
  plannedOffset: number;
  dueOffset: number;
  plannedDate: string;
  dueDate: string;
  dueTime?: string;
  overdue: boolean;
  priority: TaskPriority;
  status: TaskStatus;
  category: string;
  startTime?: string;
  endTime?: string;
  estimatedMinutes?: number;
  correctionRequested?: boolean;
  correctionReason?: string;
  recurrence?: string;
  checklist?: TaskChecklistItem[];
  validationHistory?: ValidationDecision[];
};

export type ActivityChange = { field: string; before: string; after: string };
export type ActivityEvent = {
  id: string;
  collaboratorId: string;
  taskId: string;
  action: string;
  time: string;
  timestamp?: string;
  author?: string;
  type?: "Création" | "Modification" | "Statut" | "Validation" | "Correction";
  projectId?: string;
  changes?: ActivityChange[];
};
export type PlanoriaData = { version: 1; referenceDate: string; referenceInstant: string; collaborators: Collaborator[]; projects: Project[]; tasks: Task[]; activities: ActivityEvent[] };

// Aliases conservés pour les composants Dashboard existants pendant la transition API.
export type DashboardTask = Task;
export type DemoData = PlanoriaData;

export type TaskFormValues = {
  title: string;
  description: string;
  project: string;
  collaborator: string;
  plannedDate: string;
  dueDate: string;
  priority: TaskPriority;
  category: string;
  status: string;
  startTime: string;
  endTime: string;
  deadlineTime: string;
  estimatedMinutes: string;
  recurrence: string;
  checklist: TaskChecklistItem[];
};
