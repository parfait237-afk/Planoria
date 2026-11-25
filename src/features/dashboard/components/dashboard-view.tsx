"use client";

import {
  ArrowRight, CalendarDays, CheckCircle2, Clock3, Download,
  Flag, Folder, PauseCircle, Plus, RefreshCcw, Search, TrendingUp,
  TriangleAlert, Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { AdminSidebarWithModals } from "@/components/layout/admin-sidebar-with-modals";
import { AdminTopBar } from "@/components/layout/admin-top-bar";
import { Modal } from "@/components/ui/modal";
import { PlanTaskModal, type PlanTaskValues } from "@/features/tasks/components/modals/task-form-modal";
import { type DashboardTask, type TaskPriority } from "@/features/tasks/types/task";
import { currentDateLabel } from "@/features/tasks/utils/task-dates";
import { DEFAULT_FILTERS, distribution, filterTasks, formatDue, isOverdue, metrics, taskRelations, type DashboardFilters, type PeriodFilter } from "@/features/dashboard/domain/dashboard-rules";
import { usePlanoriaData } from "@/store/planoria-store";
import { recordReviewDecision, saveTaskForm, taskToFormValues } from "@/features/tasks/services/task-actions";
import { downloadTasksCsv } from "@/features/tasks/utils/task-csv";

type TableTab = "all" | "follow" | "overdue" | "blocked";
type ChartPeriod = "week" | "month";

const buttonFocus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#059e79]";
const card = "rounded-[10px] border border-[#e3e8ec] bg-white";

export function DashboardView() {
  const router = useRouter();
  const data = usePlanoriaData();
  const [filters, setFilters] = useState<DashboardFilters>(DEFAULT_FILTERS);
  const [search, setSearch] = useState("");
  const [tableTab, setTableTab] = useState<TableTab>("all");
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>("week");
  const [taskModal, setTaskModal] = useState<"new" | "edit" | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const selectedTasks = useMemo(() => filterTasks(data.tasks, filters, data.referenceDate), [data.referenceDate, data.tasks, filters]);
  const summary = useMemo(() => metrics(selectedTasks, data.tasks), [data.tasks, selectedTasks]);
  const breakdown = useMemo(() => distribution(selectedTasks), [selectedTasks]);
  const editingTask = data.tasks.find((task) => task.id === editingTaskId);
  const urgentTasks = data.tasks.filter((task) => isOverdue(task) || task.status === "Bloquée");
  const reviewTasks = data.tasks.filter((task) => task.status === "Terminée");

  const tableTasks = selectedTasks.filter((task) => {
    const relation = taskRelations(data, task);
    const matchesSearch = `${task.title} ${relation.project?.name ?? ""} ${relation.collaborator?.name ?? ""}`.toLocaleLowerCase("fr").includes(search.toLocaleLowerCase("fr"));
    const matchesTab = tableTab === "all" || (tableTab === "follow" && (task.status === "En cours" || task.priority === "Urgente")) || (tableTab === "overdue" && isOverdue(task)) || (tableTab === "blocked" && task.status === "Bloquée");
    return matchesSearch && matchesTab;
  }).slice(0, 5);

  const openEdit = (taskId: string) => {
    setEditingTaskId(taskId);
    setTaskModal("edit");
  };

  const saveTask = async (values: PlanTaskValues) => {
    await saveTaskForm(data, values, editingTaskId);
    setTaskModal(null);
    setEditingTaskId(null);
    setNotice(editingTaskId ? "La tâche a été mise à jour." : "La tâche a été créée.");
  };

  const editInitial = editingTask ? taskToFormValues(data, editingTask) : undefined;
  const exportCsv = () => downloadTasksCsv(data, selectedTasks);

  return (
    <div className="min-h-dvh overflow-x-hidden bg-[#f7f9fb] text-[#142d4e]">
      <AdminSidebarWithModals
        activeItem="dashboard" taskCount={data.tasks.filter((task) => !["Terminée", "Validée"].includes(task.status)).length}
        userInitials="TD" userName="Tchamabe D." onNavigate={(item) => item === "tasks" ? router.push("/taches") : item === "planning" ? router.push("/planning") : item === "projects" ? router.push("/projets") : item !== "dashboard" && setNotice(`${item} sera disponible dans une prochaine étape.`)}
        onCreateTask={saveTask}
      />
      <div className="md:ml-[205px] min-[1201px]:ml-[232px]">
        <AdminTopBar currentPage="Tableau de bord" notificationCount={urgentTasks.length} onNotifications={() => setNotificationsOpen(true)} onCollaborator={() => setNotice("L’espace collaborateur sera développé dans une prochaine étape.")} />
        <main className="mx-auto max-w-[1180px] px-4 py-8 sm:px-7 lg:px-9">
          <header className="mb-5">
            <p className="text-[10px] font-bold tracking-[2px] text-[#536477]">VOTRE VUE D’ENSEMBLE</p>
            <div className="mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div><h1 className="text-[28px] font-bold tracking-[-1px] sm:text-[31px]">Tableau de bord</h1><p className="mt-2 text-xs text-[#667486]">Bonjour Tchamabe, voici où en est votre équipe aujourd’hui.</p></div>
              <div className="flex gap-2">
                <button type="button" onClick={exportCsv} className={`flex min-h-11 items-center gap-2 rounded-lg border border-[#dfe5e9] bg-white px-4 text-xs font-semibold hover:bg-[#f5f7f8] ${buttonFocus}`}><Download className="size-4" aria-hidden="true" />Exporter</button>
                <button type="button" onClick={() => { setEditingTaskId(null); setTaskModal("new"); }} className={`flex min-h-11 items-center gap-2 rounded-lg bg-[#059e79] px-4 text-xs font-semibold text-white hover:bg-[#078363] ${buttonFocus}`}><Plus className="size-4" aria-hidden="true" />Nouvelle tâche</button>
              </div>
            </div>
            <p className="mt-6 flex items-center gap-3 text-[11px] text-[#536477]"><span className="size-1.5 rounded-full bg-[#19bf92]" />{currentDateLabel(data.referenceDate)}<span className="text-[#bbc4cb]">·</span>Chaque action compte. Gardez le cap.</p>
          </header>

          <Filters filters={filters} setFilters={setFilters} projects={data.projects} collaborators={data.collaborators} />

          <button type="button" onClick={() => setReviewOpen(true)} className={`mt-4 flex w-full items-center gap-4 rounded-[11px] border border-[#059e79] bg-[#effaf6] px-5 py-5 text-left hover:bg-[#e8f7f1] ${buttonFocus}`}>
            <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-[#d9f3e9] text-[#078363]"><CheckCircle2 className="size-5" /></span>
            <span className="min-w-0"><strong className="text-base">Terminées, à contrôler <span className="ml-2 rounded-full bg-[#059e79] px-2 py-1 text-xs text-white">{summary.review}</span></strong><small className="mt-1 block text-xs text-[#667486]">Réalisations à examiner · Tous les projets et toutes les périodes</small></span>
            <span className="ml-auto hidden items-center gap-3 text-xs font-semibold text-[#078363] sm:flex">Examiner les réalisations <ArrowRight className="size-4" /></span>
          </button>

          <MetricsGrid summary={summary} selectedCount={selectedTasks.length} />

          <div className="mt-5 grid gap-5 xl:grid-cols-[1.7fr_1fr]">
            <ProgressCard tasks={selectedTasks} period={chartPeriod} onPeriodChange={setChartPeriod} />
            <DistributionCard total={selectedTasks.length} values={breakdown} />
          </div>

          <div className="mt-5 grid gap-5 xl:grid-cols-[1.7fr_1fr]">
            <PriorityTable data={data} tasks={tableTasks} selectedCount={selectedTasks.length} search={search} onSearch={setSearch} tab={tableTab} onTab={setTableTab} overdueCount={selectedTasks.filter(isOverdue).length} onEdit={openEdit} />
            <ActivityCard data={data} />
          </div>
        </main>
        <footer className="border-t border-[#e6eaed] px-6 py-5 text-center text-[10px] text-[#7a8691]">Planoria · Votre organisation, une longueur d’avance. <span className="mx-2">Données synchronisées</span></footer>
      </div>

      <NotificationsModal open={notificationsOpen} onClose={() => setNotificationsOpen(false)} data={data} tasks={urgentTasks} />
      <ReviewModal open={reviewOpen} onClose={() => setReviewOpen(false)} tasks={reviewTasks} data={data} />
      <PlanTaskModal key={`${taskModal}-${editingTaskId ?? "new"}`} open={taskModal !== null} onClose={() => { setTaskModal(null); setEditingTaskId(null); }} onSubmit={saveTask} projects={data.projects.map((project) => project.name)} collaborators={data.collaborators.map((person) => person.name)} initialValues={editInitial} modalTitle={editingTask ? "Modifier la tâche" : "Nouvelle tâche"} submitLabel={editingTask ? "Enregistrer" : "Créer la tâche"} />
      <Modal open={Boolean(notice)} onRequestClose={() => setNotice(null)} title="Information" size="sm"><p className="text-sm text-[#536477]">{notice}</p></Modal>
    </div>
  );
}

function Filters({ filters, setFilters, projects, collaborators }: { filters: DashboardFilters; setFilters: (value: DashboardFilters) => void; projects: { id: string; name: string }[]; collaborators: { id: string; name: string }[] }) {
  const set = <K extends keyof DashboardFilters>(key: K, value: DashboardFilters[K]) => setFilters({ ...filters, [key]: value });
  return <section aria-label="Filtres du tableau de bord" className={`${card} flex flex-col gap-3 p-2 lg:flex-row lg:items-center lg:justify-between`}><div className="flex overflow-x-auto rounded-lg bg-[#f5f7f8] p-1">{(["today", "week", "month"] as PeriodFilter[]).map((period) => <button key={period} type="button" aria-pressed={filters.period === period} onClick={() => set("period", period)} className={`min-h-9 whitespace-nowrap rounded-md px-3 text-[10px] font-medium ${buttonFocus} ${filters.period === period ? "bg-white font-semibold shadow-sm" : "text-[#75818c] hover:text-[#142d4e]"}`}>{period === "today" ? "Aujourd’hui" : period === "week" ? "Cette semaine" : "Ce mois"}</button>)}</div><div className="grid gap-2 sm:grid-cols-2 lg:flex"> <FilterSelect label="Filtrer par projet" icon={<Folder />} value={filters.projectId} onChange={(value) => set("projectId", value)} options={[{ id: "all", name: "Tous les projets" }, ...projects]} /><FilterSelect label="Filtrer par collaborateur" icon={<Users />} value={filters.collaboratorId} onChange={(value) => set("collaboratorId", value)} options={[{ id: "all", name: "Tous les collaborateurs" }, ...collaborators]} /><FilterSelect label="Filtrer par priorité" icon={<Flag />} value={filters.priority} onChange={(value) => set("priority", value)} options={[{ id: "all", name: "Toutes les priorités" }, ...["Urgente", "Normale", "Faible"].map((name) => ({ id: name, name }))]} /><button type="button" aria-label="Réinitialiser les filtres" onClick={() => setFilters(DEFAULT_FILTERS)} className={`grid size-10 place-items-center rounded-lg text-[#667486] hover:bg-[#f3f6f7] ${buttonFocus}`}><RefreshCcw className="size-4" /></button></div></section>;
}

function FilterSelect({ label, icon, value, onChange, options }: { label: string; icon: React.ReactNode; value: string; onChange: (value: string) => void; options: { id: string; name: string }[] }) { return <label className="relative flex items-center"><span className="pointer-events-none absolute left-3 text-[#667486] [&>svg]:size-4">{icon}</span><span className="sr-only">{label}</span><select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)} className={`min-h-10 w-full appearance-none rounded-lg border-0 bg-white pr-7 pl-9 text-[10px] text-[#536477] hover:bg-[#f7f9fa] lg:w-auto ${buttonFocus}`}>{options.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}</select></label>; }

function MetricsGrid({ summary, selectedCount }: { summary: ReturnType<typeof metrics>; selectedCount: number }) {
  const items = [
    ["Tâches du jour", summary.today, "prévues aujourd’hui", "Vue quotidienne", CalendarDays, "text-[#31566f] bg-[#eef3f7]"],
    ["Validées", summary.validated, "approuvées par l’administrateur", `sur ${selectedCount} tâches sélectionnées`, CheckCircle2, "text-[#078363] bg-[#eaf6f1]"],
    ["En cours", summary.inProgress, "actuellement actives", "En mouvement", Clock3, "text-[#31566f] bg-[#eef3f7]"],
    ["En retard", summary.overdue, "à traiter en priorité", "Attention requise", TriangleAlert, "text-[#c05f50] bg-[#fff0ed]"],
    ["En pause / bloquées", summary.paused, "nécessitent un suivi", "Faisons le point", PauseCircle, "text-[#a46c35] bg-[#fff4e9]"],
    ["Taux de réalisation", `${summary.rate}%`, "réalisées / sélection", "", TrendingUp, "text-[#078363] bg-[#eaf6f1]"],
  ] as const;
  return <section aria-label="Indicateurs" className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">{items.map(([label, value, accent, detail, Icon, tone]) => <article key={label} className={`${card} min-h-[184px] p-4`}><div className="flex items-center justify-between"><p className="text-[11px] text-[#667486]">{label}</p><span className={`grid size-8 place-items-center rounded-lg ${tone}`}><Icon className="size-4 stroke-[1.7]" /></span></div><strong className="mt-4 block text-[29px] leading-none">{value}</strong><p className="mt-4 text-[10px] font-medium text-[#078363]">{accent}</p><p className="mt-2 text-[10px] leading-4 text-[#667486]">{detail}</p>{label === "Taux de réalisation" ? <div className="mt-4 h-1 rounded-full bg-[#e6f1ed]"><div className={`h-1 rounded-full bg-[#09a77d] ${summary.rate >= 75 ? "w-3/4" : summary.rate >= 50 ? "w-1/2" : summary.rate >= 25 ? "w-1/4" : "w-0"}`} /></div> : null}</article>)}</section>;
}

function ProgressCard({ tasks, period, onPeriodChange }: { tasks: DashboardTask[]; period: ChartPeriod; onPeriodChange: (period: ChartPeriod) => void }) {
  const days = period === "week" ? [0, 1, 2, 3, 4, 5, 6] : [-14, -9, -4, 1, 6, 11];
  const bars = days.map((offset) => ({ offset, planned: tasks.filter((task) => period === "week" ? task.plannedOffset === offset : task.plannedOffset >= offset && task.plannedOffset < offset + 5).length, realized: tasks.filter((task) => (task.status === "Terminée" || task.status === "Validée") && (period === "week" ? task.dueOffset === offset : task.dueOffset >= offset && task.dueOffset < offset + 5)).length }));
  const max = Math.max(1, ...bars.map((bar) => bar.planned));
  return <section className={`${card} p-5`}><div className="flex items-start justify-between"><div><h2 className="text-sm font-bold">Progression des tâches</h2><p className="mt-2 text-[11px] text-[#667486]">Une vision claire du travail accompli.</p></div><div className="rounded-md bg-[#f5f7f8] p-1">{(["week", "month"] as ChartPeriod[]).map((value) => <button key={value} type="button" onClick={() => onPeriodChange(value)} className={`rounded px-3 py-1.5 text-[9px] ${buttonFocus} ${period === value ? "bg-white font-semibold shadow-sm" : "text-[#7b8792]"}`}>{value === "week" ? "Semaine" : "Mois"}</button>)}</div></div><div className="mt-5 flex items-end gap-2"><strong className="text-[28px]">{tasks.filter((task) => task.status === "Terminée" || task.status === "Validée").length}</strong><span className="mb-1 text-[10px] text-[#667486]">tâches réalisées</span></div><div className="mt-5 flex h-40 items-end justify-around gap-3 border-b border-[#e6eaed]" role="img" aria-label="Comparaison des tâches planifiées et réalisées">{bars.map((bar, index) => <div key={bar.offset} className="flex h-full flex-1 items-end justify-center gap-1"><div className={`w-3 rounded-t bg-[#dce6ee] ${heightClass(bar.planned, max)}`} title={`${bar.planned} planifiées`} /><div className={`w-3 rounded-t bg-[#059e79] ${heightClass(bar.realized, max)}`} title={`${bar.realized} réalisées`} /><span className="absolute sr-only">Période {index + 1}: {bar.planned} planifiées, {bar.realized} réalisées</span></div>)}</div><div className="mt-4 flex gap-5 text-[9px] text-[#667486]"><span><i className="mr-2 inline-block size-2 rounded bg-[#dce6ee]" />Planifiées</span><span><i className="mr-2 inline-block size-2 rounded bg-[#059e79]" />Réalisées</span></div></section>;
}
function heightClass(value: number, max: number) { const ratio = value / max; return ratio >= .8 ? "h-[85%]" : ratio >= .6 ? "h-[65%]" : ratio >= .4 ? "h-[45%]" : ratio > 0 ? "h-[25%]" : "h-1"; }

function DistributionCard({ total, values }: { total: number; values: ReturnType<typeof distribution> }) {
  const parts = [["Réalisées", values.realized, "bg-[#059e79]"], ["En cours", values.inProgress, "bg-[#6f8ba2]"], ["En retard", values.overdue, "bg-[#dc7463]"], ["À faire / en pause", values.remaining, "bg-[#d7dfe5]"]] as const;
  return <section className={`${card} p-5`}><h2 className="text-sm font-bold">Répartition des tâches</h2><p className="mt-2 text-[11px] text-[#667486]">L’essentiel en un coup d’œil.</p><div className="relative mx-auto mt-6 grid size-40 place-items-center rounded-full bg-[conic-gradient(#059e79_0_30%,#6f8ba2_30%_50%,#dc7463_50%_65%,#d7dfe5_65%)]" role="img" aria-label={`${total} tâches au total`}><div className="grid size-24 place-items-center rounded-full bg-white text-center"><span><strong className="block text-2xl">{total}</strong><small className="text-[9px] text-[#667486]">tâches au total</small></span></div></div><ul className="mt-6 grid gap-3">{parts.map(([label, count, color]) => <li key={label} className="flex items-center text-[10px] text-[#536477]"><span className={`mr-2 size-2 rounded-full ${color}`} />{label}<strong className="ml-auto text-[#142d4e]">{count}</strong></li>)}</ul></section>;
}

function PriorityTable({ data, tasks, selectedCount, search, onSearch, tab, onTab, overdueCount, onEdit }: { data: ReturnType<typeof usePlanoriaData>; tasks: DashboardTask[]; selectedCount: number; search: string; onSearch: (value: string) => void; tab: TableTab; onTab: (tab: TableTab) => void; overdueCount: number; onEdit: (id: string) => void }) {
  const tabs: [TableTab, string][] = [["all", "Toutes les tâches"], ["follow", "À suivre"], ["overdue", `En retard ${overdueCount}`], ["blocked", "Bloquées"]];
  return <section className={`${card} min-w-0 p-5`}><div className="flex items-center gap-2"><h2 className="text-sm font-bold">Les priorités de l’équipe</h2><span className="rounded bg-[#eef2f4] px-2 py-1 text-[9px]">{selectedCount}</span></div><p className="mt-2 text-[11px] text-[#667486]">Les bonnes actions, au bon moment.</p><div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="flex overflow-x-auto border-b border-[#e7ebee]">{tabs.map(([value, label]) => <button key={value} type="button" onClick={() => onTab(value)} className={`whitespace-nowrap border-b-2 px-3 py-2 text-[9px] ${buttonFocus} ${tab === value ? "border-[#059e79] font-semibold text-[#078363]" : "border-transparent text-[#667486]"}`}>{label}</button>)}</div><label className="relative"><Search className="absolute top-2.5 left-3 size-4 text-[#8a959f]" /><span className="sr-only">Rechercher une tâche</span><input value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Rechercher une tâche" className={`min-h-9 w-full rounded-lg border border-[#e0e5e9] pl-9 text-[10px] outline-none sm:w-48 ${buttonFocus}`} /></label></div><div className="mt-3 overflow-x-auto"><table className="w-full min-w-[690px] border-collapse text-left"><thead><tr className="border-b border-[#e7ebee] text-[9px] tracking-wide text-[#75818c]"><th className="px-2 py-3 font-semibold">TÂCHE / PROJET</th><th className="px-2 py-3 font-semibold">RESPONSABLE</th><th className="px-2 py-3 font-semibold">ÉCHÉANCE</th><th className="px-2 py-3 font-semibold">STATUT</th><th className="px-2 py-3 font-semibold">PRIORITÉ</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{tasks.map((task) => { const relation = taskRelations(data, task); return <tr key={task.id} className="border-b border-[#edf0f2] text-[10px]"><td className="px-2 py-4"><strong className="block text-[11px]">{task.title}</strong><span className="mt-1 block text-[#7b8792]">{relation.project?.name}</span></td><td className="px-2 py-4"><span className="mr-2 inline-grid size-6 place-items-center rounded-full bg-[#eaf6f1] font-bold text-[#078363]">{relation.collaborator?.initials}</span>{relation.collaborator?.name}</td><td className="px-2 py-4">{formatDue(task.dueDate, data.referenceDate)}</td><td className="px-2 py-4"><StatusBadge task={task} /></td><td className="px-2 py-4"><PriorityBadge priority={task.priority} /></td><td className="px-2 py-4"><button type="button" onClick={() => onEdit(task.id)} className={`rounded-lg border border-[#e1e6e9] px-2 py-1.5 text-[9px] hover:bg-[#f4f7f8] ${buttonFocus}`}>Modifier</button></td></tr>; })}</tbody></table>{!tasks.length ? <p className="py-10 text-center text-xs text-[#75818c]">Aucune tâche ne correspond à cette sélection.</p> : null}</div><p className="mt-4 text-[9px] text-[#7b8792]">{tasks.length} tâches affichées sur {selectedCount}</p></section>;
}
function StatusBadge({ task }: { task: DashboardTask }) { const label = isOverdue(task) ? "En retard" : task.status; const tone = label === "En retard" ? "bg-[#fff0ed] text-[#b95749]" : label === "En cours" ? "bg-[#edf3f7] text-[#31566f]" : label === "Bloquée" ? "bg-[#fff3e8] text-[#a46c35]" : "bg-[#eaf6f1] text-[#078363]"; return <span className={`rounded px-2 py-1 font-medium ${tone}`}>{label}</span>; }
function PriorityBadge({ priority }: { priority: TaskPriority }) { return <span className={`rounded px-2 py-1 ${priority === "Urgente" ? "bg-[#fff0ed] text-[#b95749]" : priority === "Faible" ? "bg-[#f2f4f6] text-[#667486]" : "bg-[#f8f4eb] text-[#8d6a38]"}`}>{priority}</span>; }

function ActivityCard({ data }: { data: ReturnType<typeof usePlanoriaData> }) { return <aside className={`${card} p-5`}><h2 className="text-sm font-bold">Activité récente</h2><p className="mt-2 text-[11px] text-[#667486]">L’équipe en mouvement.</p><div className="mt-5 grid gap-5">{data.activities.slice(0, 5).map((activity) => { const person = data.collaborators.find((entry) => entry.id === activity.collaboratorId); const task = data.tasks.find((entry) => entry.id === activity.taskId); return <article key={activity.id} className="flex gap-3"><span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#eaf6f1] text-[10px] font-bold text-[#078363]">{person?.initials}</span><p className="text-[10px] leading-4"><strong>{person?.name}</strong> {activity.action}<span className="block font-medium text-[#334b61]">{task?.title}</span><small className="text-[#8a959f]">{activity.time}</small></p></article>; })}{!data.activities.length ? <p className="text-xs text-[#75818c]">Aucune activité récente.</p> : null}</div><div className="mt-7 border-t border-[#e8ecef] pt-5"><div className="flex -space-x-2">{data.collaborators.map((person) => <span key={person.id} className="grid size-8 place-items-center rounded-full border-2 border-white bg-[#edf2f5] text-[9px] font-bold">{person.initials}</span>)}</div><strong className="mt-3 block text-[11px]">Ensemble, on avance.</strong><p className="mt-1 text-[10px] text-[#75818c]">{data.collaborators.length} collaborateurs dans votre équipe</p></div></aside>; }

function NotificationsModal({ open, onClose, data, tasks }: { open: boolean; onClose: () => void; data: ReturnType<typeof usePlanoriaData>; tasks: DashboardTask[] }) { const overdue = tasks.filter(isOverdue); const blocked = tasks.filter((task) => task.status === "Bloquée"); return <Modal open={open} onRequestClose={onClose} title="Votre attention est requise" size="sm"><div className="mb-5 flex gap-2 text-[10px]"><span className="rounded bg-[#eaf6f1] px-2 py-1 text-[#078363]">{overdue.length} en retard</span><span className="rounded bg-[#eaf6f1] px-2 py-1 text-[#078363]">{blocked.length} bloquée(s)</span></div><div className="grid gap-4">{tasks.map((task) => { const relation = taskRelations(data, task); return <article key={task.id}><strong className="text-xs">{task.title}</strong><p className="mt-1 text-[11px] text-[#667486]">{relation.collaborator?.name} · {isOverdue(task) ? "En retard" : task.status}</p></article>; })}{!tasks.length ? <p className="text-xs text-[#667486]">Aucune alerte actuellement.</p> : null}</div></Modal>; }

function ReviewModal({ open, onClose, tasks, data }: { open: boolean; onClose: () => void; tasks: DashboardTask[]; data: ReturnType<typeof usePlanoriaData> }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [action, setAction] = useState<"validated" | "correction">("validated");
  const [reason, setReason] = useState("");
  const commit = async (task: DashboardTask) => {
    if (!reason.trim()) return;
    await recordReviewDecision(task, action, reason);
    setSelectedId(null); setReason(""); setAction("validated");
  };
  return <Modal open={open} onRequestClose={onClose} title="Réalisations à contrôler" description="Validez le travail livré ou demandez une correction motivée." size="lg"><div className="grid gap-3">{tasks.map((task) => { const relation = taskRelations(data, task); return <article key={task.id} className="rounded-lg border border-[#e3e8ec] p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-center"><div><strong className="text-xs">{task.title}</strong><p className="mt-1 text-[10px] text-[#667486]">{relation.project?.name} · {relation.collaborator?.name}</p></div><div className="ml-auto flex gap-2"><button type="button" onClick={() => { setSelectedId(task.id); setAction("validated"); }} className={`rounded-lg bg-[#059e79] px-3 py-2 text-[10px] font-semibold text-white ${buttonFocus}`}>Valider</button><button type="button" onClick={() => { setSelectedId(task.id); setAction("correction"); }} className={`rounded-lg border border-[#dfe5e9] px-3 py-2 text-[10px] font-semibold ${buttonFocus}`}>Demander une correction</button></div></div>{selectedId === task.id ? <div className="mt-4"><label className="text-[10px] font-medium">Motif obligatoire<textarea value={reason} onChange={(event) => setReason(event.target.value)} required className={`mt-2 min-h-20 w-full rounded-lg border border-[#dfe5e9] p-3 text-xs outline-none ${buttonFocus}`} /></label><div className="mt-2 flex justify-end gap-2"><button type="button" onClick={() => { setSelectedId(null); setReason(""); }} className={`px-3 py-2 text-[10px] ${buttonFocus}`}>Annuler</button><button type="button" disabled={!reason.trim()} onClick={() => commit(task)} className={`rounded-lg bg-[#142d4e] px-3 py-2 text-[10px] font-semibold text-white disabled:opacity-40 ${buttonFocus}`}>Enregistrer la décision</button></div></div> : null}</article>; })}{!tasks.length ? <p className="py-8 text-center text-xs text-[#667486]">Aucune réalisation en attente de contrôle.</p> : null}</div></Modal>;
}


