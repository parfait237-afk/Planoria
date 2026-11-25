"use client";

import { CalendarDays, ChevronLeft, ChevronRight, CircleCheck, Clock3, Download, LayoutGrid, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AdminSidebarWithModals } from "@/components/layout/admin-sidebar-with-modals";
import { AdminTopBar } from "@/components/layout/admin-top-bar";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { PlanningFiltersBar } from "@/features/planning/components/planning-filters";
import { KanbanView, ListView, MonthView, TodayView, WeekView } from "@/features/planning/components/planning-views";
import { PlanningWorkload } from "@/features/planning/components/planning-workload";
import { dateFromOffset, formatDay, startOfWeek, addDays } from "@/features/planning/domain/planning-dates";
import { usePlanning } from "@/features/planning/hooks/use-planning";
import { movePlanningTask } from "@/features/planning/services/planning-actions";
import type { PlanningView } from "@/features/planning/types/planning";
import { PlanTaskModal, type PlanTaskValues } from "@/features/tasks/components/modals/task-form-modal";
import { saveTaskForm, taskToFormValues } from "@/features/tasks/services/task-actions";
import type { Task } from "@/features/tasks/types/task";
import { downloadTasksCsv } from "@/features/tasks/utils/task-csv";
import { taskOffsetToInputDate } from "@/features/tasks/utils/task-dates";
import { usePlanoriaData } from "@/store/planoria-store";

const views: { id: PlanningView; label: string; icon: typeof LayoutGrid }[] = [{ id: "kanban", label: "Kanban", icon: LayoutGrid }, { id: "today", label: "Aujourd’hui", icon: Clock3 }, { id: "week", label: "Semaine", icon: CalendarDays }, { id: "month", label: "Mois", icon: CalendarDays }, { id: "list", label: "Liste", icon: CircleCheck }];

export function PlanningPage() {
  const router = useRouter(); const data = usePlanoriaData(); const planning = usePlanning(data);
  const [taskModal, setTaskModal] = useState(false); const [editingId, setEditingId] = useState<string | null>(null); const [plannedOffset, setPlannedOffset] = useState(0); const [capacity, setCapacity] = useState(35); const [notice, setNotice] = useState<string | null>(null);
  const editingTask = data.tasks.find((task) => task.id === editingId);
  const openTask = (task: Task) => { setEditingId(task.id); setTaskModal(true); };
  const createTask = (offset = 0) => { setEditingId(null); setPlannedOffset(offset); setTaskModal(true); };
  const save = async (values: PlanTaskValues) => { await saveTaskForm(data, values, editingId); setTaskModal(false); setEditingId(null); };
  const periodStep = planning.view === "month" ? 28 : planning.view === "today" ? 1 : 7;
  const anchor = dateFromOffset(planning.anchorOffset, data.referenceDate); const weekStart = startOfWeek(anchor); const weekEnd = addDays(weekStart, 6);
  const periodLabel = planning.view === "month" ? formatDay(anchor, { month: "long", year: "numeric" }) : planning.view === "today" ? formatDay(anchor, { weekday: "long", day: "numeric", month: "long" }) : `${formatDay(weekStart, { day: "numeric" })} – ${formatDay(weekEnd, { day: "numeric", month: "long" })}`;
  const shared = { data, tasks: planning.tasks, anchorOffset: planning.anchorOffset, onOpen: openTask, onCreate: createTask, onMove: movePlanningTask };

  return <div className="min-h-dvh overflow-x-hidden bg-[#f7f9fb] text-[#142d4e]"><AdminSidebarWithModals activeItem="planning" taskCount={data.tasks.filter((task) => !["Terminée", "Validée"].includes(task.status)).length} onNavigate={(item) => item === "dashboard" ? router.push("/") : item === "tasks" ? router.push("/taches") : item !== "planning" && setNotice(`${item} sera disponible dans une prochaine étape.`)} onCreateTask={save} /><div className="md:ml-[205px] min-[1201px]:ml-[232px]"><AdminTopBar currentPage="Planification" notificationCount={data.tasks.filter((task) => task.status === "Bloquée").length} onNotifications={() => setNotice("Les tâches qui demandent votre attention sont visibles dans le planning.")} onCollaborator={() => setNotice("L’espace collaborateur sera développé dans une prochaine étape.")} /><main className="mx-auto max-w-[1280px] px-4 py-8 sm:px-7 lg:px-9"><header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center"><div><p className="text-[10px] font-bold tracking-[2px] text-[#536477]">VOTRE VUE D’ENSEMBLE</p><h1 className="mt-3 text-[28px] font-bold tracking-[-1px] sm:text-[31px]">Planification</h1><p className="mt-2 text-xs text-[#667486]">La bonne vue pour garder une longueur d’avance.</p></div><div className="flex gap-2"><Button type="button" onClick={() => downloadTasksCsv(data, planning.tasks)}><Download className="size-4" />Exporter</Button><Button type="button" variant="primary" onClick={() => createTask(0)}><Plus className="size-4" />Nouvelle tâche</Button></div></header>
  <div className="mt-7 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between"><div className="flex w-fit max-w-full overflow-x-auto rounded-[9px] border border-[#e3e8ec] bg-white p-1">{views.map(({ id, label, icon: Icon }) => <button key={id} type="button" aria-pressed={planning.view === id} onClick={() => planning.setView(id)} className={`flex min-h-10 shrink-0 items-center gap-2 rounded-[7px] px-3 text-[10px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-[#059e79] ${planning.view === id ? "bg-[#059e79] text-white shadow-sm" : "text-[#536477] hover:bg-[#f2f7f5]"}`}><Icon className="size-4" />{label}</button>)}</div>{planning.view !== "kanban" && planning.view !== "list" ? <div className="flex items-center gap-2"><button type="button" aria-label="Période précédente" onClick={() => planning.setAnchorOffset(planning.anchorOffset - periodStep)} className="grid size-9 place-items-center rounded-lg border border-[#e1e7eb] bg-white"><ChevronLeft className="size-4" /></button><strong className="min-w-36 text-center text-xs capitalize">{periodLabel}</strong><button type="button" aria-label="Période suivante" onClick={() => planning.setAnchorOffset(planning.anchorOffset + periodStep)} className="grid size-9 place-items-center rounded-lg border border-[#e1e7eb] bg-white"><ChevronRight className="size-4" /></button><button type="button" onClick={() => planning.setAnchorOffset(0)} className="h-9 rounded-lg border border-[#e1e7eb] bg-white px-3 text-[9px] font-semibold">Aujourd’hui</button></div> : null}</div>
  <div className="mt-5"><PlanningFiltersBar data={data} filters={planning.filters} advancedOpen={planning.advancedOpen} onAdvanced={() => planning.setAdvancedOpen(!planning.advancedOpen)} onChange={planning.setFilter} onReset={planning.resetFilters} /></div><div className="my-4 flex items-center text-[10px] text-[#667486]"><span>{planning.tasks.length} tâches {planning.view === "kanban" || planning.view === "list" ? "dans la sélection" : "sur la période"}</span><span className="ml-auto flex gap-4"><i className="not-italic before:mr-1 before:text-[#d9a143] before:content-['•']">Urgence</i><i className="not-italic before:mr-1 before:text-[#d67f69] before:content-['•']">Retard</i><i className="not-italic before:mr-1 before:text-[#0daa80] before:content-['•']">Terminé</i></span></div>
  {planning.view === "kanban" ? <KanbanView {...shared} /> : planning.view === "today" ? <TodayView {...shared} /> : planning.view === "week" ? <WeekView {...shared} /> : planning.view === "month" ? <MonthView {...shared} /> : <ListView {...shared} />}<PlanningWorkload data={data} tasks={planning.tasks} capacity={capacity} onCapacityChange={setCapacity} /><p className="mt-4 text-center text-[9px] text-[#7b8792]">Vues synchronisées avec la gestion des tâches et PostgreSQL.</p></main><footer className="border-t border-[#e6eaed] px-6 py-5 text-center text-[10px] text-[#7a8691]">Planoria · Votre organisation, une longueur d’avance. <span className="mx-2">Données synchronisées</span></footer></div>
  <PlanTaskModal key={`${taskModal}-${editingId ?? plannedOffset}`} open={taskModal} onClose={() => { setTaskModal(false); setEditingId(null); }} onSubmit={save} projects={data.projects.map((project) => project.name)} collaborators={data.collaborators.map((person) => person.name)} initialValues={editingTask ? taskToFormValues(data, editingTask) : { plannedDate: taskOffsetToInputDate(plannedOffset, data.referenceDate), dueDate: taskOffsetToInputDate(plannedOffset, data.referenceDate) }} modalTitle={editingTask ? "Modifier la tâche" : "Nouvelle tâche"} submitLabel={editingTask ? "Enregistrer" : "Créer la tâche"} /><Modal open={Boolean(notice)} onRequestClose={() => setNotice(null)} title="Information" size="sm"><p className="text-sm text-[#536477]">{notice}</p></Modal></div>;
}


