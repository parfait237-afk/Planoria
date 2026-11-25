"use client";

import { Download, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AdminSidebarWithModals } from "@/components/layout/admin-sidebar-with-modals";
import { AdminTopBar } from "@/components/layout/admin-top-bar";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { TaskStats } from "@/features/tasks/components/task-stats";
import { TaskFilters } from "@/features/tasks/components/task-filters";
import { TaskStatusTabs } from "@/features/tasks/components/task-status-tabs";
import { TaskBulkActions } from "@/features/tasks/components/task-bulk-actions";
import { TaskTable } from "@/features/tasks/components/task-table";
import { TaskPagination } from "@/features/tasks/components/task-pagination";
import { PlanTaskModal, type PlanTaskValues } from "@/features/tasks/components/modals/task-form-modal";
import { TaskReviewModal } from "@/features/tasks/components/modals/task-review-modal";
import { TaskDecisionHistoryModal } from "@/features/tasks/components/modals/task-decision-history-modal";
import { TaskAttentionModal } from "@/features/tasks/components/modals/task-attention-modal";
import { useTaskManagement } from "@/features/tasks/hooks/use-task-management";
import { isTaskOverdue } from "@/features/tasks/domain/task-rules";
import { reopenValidatedTask, saveTaskForm, taskToFormValues, updateSelectedTaskStatus } from "@/features/tasks/services/task-actions";
import { downloadTasksCsv } from "@/features/tasks/utils/task-csv";
import { usePlanoriaData } from "@/store/planoria-store";

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#059e79]";

export function TaskManagementPage() {
  const router = useRouter();
  const data = usePlanoriaData();
  const taskState = useTaskManagement(data);
  const [taskModal, setTaskModal] = useState<"new" | "edit" | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [reviewTaskId, setReviewTaskId] = useState<string | null>(null);
  const [decisionTaskId, setDecisionTaskId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const projectQueryApplied = useRef(false);

  const editingTask = data.tasks.find((task) => task.id === editingId);
  const reviewTask = data.tasks.find((task) => task.id === reviewTaskId);
  const decisionTask = data.tasks.find((task) => task.id === decisionTaskId);
  const attentionTasks = data.tasks.filter((task) => isTaskOverdue(task) || task.status === "Bloquée");
  const editInitial = editingTask ? taskToFormValues(data, editingTask) : undefined;

  useEffect(() => {
    if (projectQueryApplied.current) return;
    projectQueryApplied.current = true;
    const projectId = new URLSearchParams(window.location.search).get("project");
    if (projectId && data.projects.some((project) => project.id === projectId)) {
      taskState.setFilter("projectId", projectId);
    }
  }, [data.projects, taskState]);

  const saveTask = async (values: PlanTaskValues) => {
    await saveTaskForm(data, values, editingId);
    setTaskModal(null);
    setEditingId(null);
  };
  const exportTasks = () => {
    const selected = taskState.filteredTasks.filter((task) => taskState.selectedIds.has(task.id));
    downloadTasksCsv(data, selected.length ? selected : taskState.filteredTasks);
  };
  const applyBulkStatus = async (status: "À faire" | "En cours" | "En pause") => {
    const result = await updateSelectedTaskStatus(taskState.selectedIds, status);
    taskState.clearSelection();
    setNotice(`${result.updated} tâche(s) mise(s) à jour.${result.ignored ? ` ${result.ignored} tâche(s) terminée(s) ou validée(s) ignorée(s).` : ""}`);
  };

  return (
    <div className="min-h-dvh overflow-x-hidden bg-[#f7f9fb] text-[#142d4e]">
      <AdminSidebarWithModals activeItem="tasks" taskCount={data.tasks.filter((task) => !["Terminée", "Validée"].includes(task.status)).length} userInitials="TD" userName="Tchamabe D." onNavigate={(item) => item === "dashboard" ? router.push("/") : item === "planning" ? router.push("/planning") : item === "projects" ? router.push("/projets") : item !== "tasks" && setNotice(`${item} sera disponible dans une prochaine étape.`)} onCreateTask={saveTask} />
      <div className="md:ml-[205px] min-[1201px]:ml-[232px]">
        <AdminTopBar currentPage="Gestion des tâches" notificationCount={attentionTasks.length} onNotifications={() => setNotificationsOpen(true)} onCollaborator={() => setNotice("L’espace collaborateur sera développé dans une prochaine étape.")} />
        <main className="mx-auto max-w-[1180px] px-4 py-8 sm:px-7 lg:px-9">
          <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center"><div><p className="text-[10px] font-bold tracking-[2px] text-[#536477]">VOTRE VUE D’ENSEMBLE</p><h1 className="mt-3 text-[28px] font-bold tracking-[-1px] sm:text-[31px]">Gestion des tâches</h1><p className="mt-2 text-xs text-[#667486]">De la première idée à la dernière étape, gardez le contrôle.</p></div><div className="flex gap-2"><Button type="button" onClick={exportTasks}><Download className="size-4" />Exporter</Button><Button type="button" variant="primary" onClick={() => { setEditingId(null); setTaskModal("new"); }}><Plus className="size-4" />Nouvelle tâche</Button></div></header>
          <TaskStats tasks={data.tasks} />
          <section className="mt-5 min-w-0 rounded-[10px] border border-[#e3e8ec] bg-white">
            <div className="flex flex-col gap-4 border-b border-[#e7ebee] p-5 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex items-center gap-2"><h2 className="text-base font-bold">Toutes les tâches</h2><span className="rounded bg-[#eef2f4] px-2 py-1 text-[9px]">{taskState.filteredTasks.length}</span></div><p className="mt-2 text-[11px] text-[#667486]">Un espace pour organiser, attribuer et faire avancer le travail.</p></div><button type="button" onClick={exportTasks} className={`flex min-h-10 items-center gap-2 rounded-lg border border-[#dfe5e9] px-3 text-[10px] font-semibold hover:bg-[#f5f7f8] ${focus}`}><Download className="size-4" />Exporter la sélection</button></div>
            <TaskStatusTabs tasks={data.tasks} active={taskState.filters.status} onChange={(status) => taskState.setFilter("status", status)} />
            <TaskFilters filters={taskState.filters} projects={data.projects} collaborators={data.collaborators} onChange={taskState.setFilter} onReset={taskState.resetFilters} />
            {taskState.selectedIds.size ? <TaskBulkActions count={taskState.selectedIds.size} onClear={taskState.clearSelection} onStatus={applyBulkStatus} /> : null}
            <TaskTable data={data} tasks={taskState.pageTasks} selectedIds={taskState.selectedIds} pageSelected={taskState.pageSelected} onTogglePage={taskState.togglePageSelection} onToggle={taskState.toggleSelection} sortKey={taskState.sortKey} sortDirection={taskState.sortDirection} onSort={taskState.toggleSort} onEdit={(id) => { setEditingId(id); setTaskModal("edit"); }} onReview={setReviewTaskId} onDecision={setDecisionTaskId} />
            <TaskPagination page={taskState.page} pageCount={taskState.pageCount} total={taskState.filteredTasks.length} onPageChange={taskState.setPage} />
          </section>
        </main>
        <footer className="border-t border-[#e6eaed] px-6 py-5 text-center text-[10px] text-[#7a8691]">Planoria · Votre organisation, une longueur d’avance. <span className="mx-2">Données synchronisées</span></footer>
      </div>
      <PlanTaskModal key={`${taskModal}-${editingId ?? "new"}`} open={taskModal !== null} onClose={() => { setTaskModal(null); setEditingId(null); }} onSubmit={saveTask} projects={data.projects.map((project) => project.name)} collaborators={data.collaborators.map((person) => person.name)} initialValues={editInitial} modalTitle={editingTask ? "Modifier la tâche" : "Nouvelle tâche"} submitLabel={editingTask ? "Enregistrer" : "Créer la tâche"} />
      <TaskReviewModal open={Boolean(reviewTask)} task={reviewTask} data={data} onClose={() => setReviewTaskId(null)} />
      <TaskDecisionHistoryModal open={Boolean(decisionTask)} task={decisionTask} onClose={() => setDecisionTaskId(null)} onReopen={(task) => { reopenValidatedTask(task); setDecisionTaskId(null); }} />
      <TaskAttentionModal open={notificationsOpen} tasks={attentionTasks} data={data} onClose={() => setNotificationsOpen(false)} />
      <Modal open={Boolean(notice)} onRequestClose={() => setNotice(null)} title="Information" size="sm"><p className="text-sm text-[#536477]">{notice}</p></Modal>
    </div>
  );
}
