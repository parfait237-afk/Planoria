import type { PlanoriaData } from "@/features/tasks/types/task";

export const PLANORIA_DEMO_DATA: PlanoriaData = {
  version: 1,
  referenceDate: "2026-11-16",
  referenceInstant: "2026-11-16T12:00:00+01:00",
  collaborators: [
    { id: "alice", name: "Alice", initials: "A", role: "Collaboratrice" }, { id: "marc", name: "Marc", initials: "M", role: "Collaborateur" },
    { id: "sarah", name: "Sarah", initials: "S", role: "Collaboratrice" }, { id: "david", name: "David", initials: "D", role: "Collaborateur" },
  ],
  projects: [
    { id: "success-design", name: "Success Design", description: "Création graphique et projets clients.", ownerId: "alice", memberIds: ["alice", "david", "sarah"], color: "Violet", status: "En cours", startDate: "2026-11-02", targetDate: "2026-12-18" },
    { id: "success-stylz", name: "Success Stylz", description: "Collections, production et communication.", ownerId: "marc", memberIds: ["marc", "alice", "sarah"], color: "Émeraude", status: "En cours", startDate: "2026-10-12", targetDate: "2026-12-04" },
    { id: "event-manager", name: "Event Manager", description: "Organisation et suivi des événements.", ownerId: "sarah", memberIds: ["sarah", "david", "marc"], color: "Ambre", status: "En pause", startDate: "2026-11-09", targetDate: "2026-12-12" },
    { id: "archive-brand", name: "Archives de marque", description: "Livrables historiques et documentation validée.", memberIds: [], color: "Bleu", status: "Archivé" },
  ],
  tasks: [
    { id: "t1", title: "Finaliser la maquette du site web", description: "Préparer la version client", projectId: "success-design", collaboratorId: "alice", plannedOffset: 0, dueOffset: 0, plannedDate: "2026-11-16", dueDate: "2026-11-16", overdue: false, priority: "Urgente", status: "En cours", category: "Design", startTime: "09:00", endTime: "12:00", estimatedMinutes: 180, checklist: [{ id: "t1-c1", label: "Desktop", completed: true }, { id: "t1-c2", label: "Mobile", completed: false }] },
    { id: "t2", title: "Préparer la présentation client", description: "Structurer la réunion", projectId: "success-design", collaboratorId: "david", plannedOffset: 1, dueOffset: 1, plannedDate: "2026-11-17", dueDate: "2026-11-17", overdue: false, priority: "Normale", status: "En cours", category: "Communication", estimatedMinutes: 120 },
    { id: "t3", title: "Valider les visuels de la collection", description: "Contrôle final", projectId: "success-stylz", collaboratorId: "marc", plannedOffset: -3, dueOffset: -2, plannedDate: "2026-11-13", dueDate: "2026-11-14", overdue: true, priority: "Urgente", status: "À faire", category: "Design" },
    { id: "t4", title: "Valider le budget de l’événement", description: "Vérifier les postes", projectId: "event-manager", collaboratorId: "sarah", plannedOffset: -4, dueOffset: -3, plannedDate: "2026-11-12", dueDate: "2026-11-13", overdue: true, priority: "Urgente", status: "À faire", category: "Organisation" },
    { id: "t5", title: "Confirmer les prestataires de l’événement", description: "Attente du traiteur", projectId: "event-manager", collaboratorId: "sarah", plannedOffset: 0, dueOffset: 0, plannedDate: "2026-11-16", dueDate: "2026-11-16", overdue: false, priority: "Normale", status: "Bloquée", category: "Organisation" },
    { id: "t6", title: "Réviser le devis client", description: "Clarifier les options", projectId: "success-design", collaboratorId: "marc", plannedOffset: 0, dueOffset: 2, plannedDate: "2026-11-16", dueDate: "2026-11-18", overdue: false, priority: "Faible", status: "En pause", category: "Communication", recurrence: "Hebdomadaire" },
    { id: "t7", title: "Valider les déclinaisons du logo", description: "Livrables déposés", projectId: "success-design", collaboratorId: "alice", plannedOffset: 0, dueOffset: 0, plannedDate: "2026-11-16", dueDate: "2026-11-16", overdue: false, priority: "Normale", status: "Terminée", category: "Design" },
    { id: "t8", title: "Livrer la charte graphique", description: "Version PDF et sources", projectId: "success-design", collaboratorId: "sarah", plannedOffset: 0, dueOffset: 0, plannedDate: "2026-11-16", dueDate: "2026-11-16", overdue: false, priority: "Normale", status: "Terminée", category: "Organisation" },
    { id: "t9", title: "Créer les invitations de la soirée", description: "Formats web et impression", projectId: "event-manager", collaboratorId: "marc", plannedOffset: 0, dueOffset: 0, plannedDate: "2026-11-16", dueDate: "2026-11-16", overdue: false, priority: "Normale", status: "Terminée", category: "Design" },
    { id: "t10", title: "Mettre à jour le guide de marque", description: "Corrections intégrées", projectId: "success-stylz", collaboratorId: "david", plannedOffset: -1, dueOffset: 0, plannedDate: "2026-11-15", dueDate: "2026-11-16", overdue: false, priority: "Faible", status: "Validée", category: "Communication", validationHistory: [{ id: "decision-t10", type: "validated", author: "Tchamabe D.", date: "16 novembre 2026 à 10:15", reason: "Livrable conforme à la demande." }] },
    { id: "t11", title: "Planifier la séance photo", description: "Coordonner le studio", projectId: "success-stylz", collaboratorId: "alice", plannedOffset: 3, dueOffset: 4, plannedDate: "2026-11-19", dueDate: "2026-11-20", overdue: false, priority: "Normale", status: "À faire", category: "Production" },
    { id: "t12", title: "Préparer le bilan hebdomadaire", description: "Synthétiser les avancées", projectId: "success-design", collaboratorId: "david", plannedOffset: 5, dueOffset: 5, plannedDate: "2026-11-21", dueDate: "2026-11-21", overdue: false, priority: "Faible", status: "À faire", category: "Organisation", correctionRequested: true, correctionReason: "Ajouter les risques et les prochaines décisions.", validationHistory: [{ id: "decision-t12", type: "correction", author: "Tchamabe D.", date: "15 novembre 2026 à 16:40", reason: "Ajouter les risques et les prochaines décisions." }] },
  ],
  activities: [
    { id: "audit-1", collaboratorId: "alice", taskId: "t7", projectId: "success-design", action: "Statut modifié", time: "16/11/2026 à 12:06", timestamp: "2026-11-16T12:06:00+01:00", author: "Administrateur", type: "Statut", changes: [{ field: "Statut", before: "En cours", after: "Terminée" }] },
    { id: "audit-2", collaboratorId: "sarah", taskId: "t5", projectId: "event-manager", action: "Statut modifié", time: "16/11/2026 à 12:05", timestamp: "2026-11-16T12:05:57+01:00", author: "Administrateur", type: "Statut", changes: [{ field: "Statut", before: "En cours", after: "Bloquée" }] },
    { id: "a1", collaboratorId: "alice", taskId: "t7", action: "a terminé", time: "Aujourd’hui à 09:42" },
    { id: "a2", collaboratorId: "sarah", taskId: "t5", action: "a signalé un blocage sur", time: "Aujourd’hui à 09:25" },
    { id: "a3", collaboratorId: "david", taskId: "t2", action: "a commencé", time: "Aujourd’hui à 09:10" },
    { id: "a4", collaboratorId: "marc", taskId: "t6", action: "a mis en pause", time: "Aujourd’hui à 08:45" },
  ],
};

export function clonePlanoriaDemoData(): PlanoriaData {
  return JSON.parse(JSON.stringify(PLANORIA_DEMO_DATA)) as PlanoriaData;
}



