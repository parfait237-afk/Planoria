"use client";
import {
  BarChart3,
  Clock3,
  Download,
  FileSpreadsheet,
  FileText,
  MessageCircle,
  Plus,
  Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";
import { AdminSidebarWithModals } from "@/components/layout/admin-sidebar-with-modals";
import { AdminTopBar } from "@/components/layout/admin-top-bar";
import { Modal } from "@/components/ui/modal";
import { ReportFiltersBar } from "@/features/reports/components/report-filters";
import { ReportsView } from "@/features/reports/components/reports-view";
import { HistoryView } from "@/features/reports/components/history-view";
import { AssistantView } from "@/features/reports/components/assistant-view";
import { filterReportTasks } from "@/features/reports/domain/report-rules";
import type {
  ReportFilters,
  ReportPeriod,
  ReportTab,
} from "@/features/reports/types/report";
import {
  exportCsv,
  exportPdf,
  exportXlsx,
} from "@/features/reports/utils/report-export";
import { saveTaskForm } from "@/features/tasks/services/task-actions";
import type { Task } from "@/features/tasks/types/task";
import { usePlanoriaData } from "@/store/planoria-store";
import { mondayOfWeek, sundayOfWeek } from "@/lib/cameroon-date";
function weekFilters(referenceDate: string): ReportFilters { return {
  from: mondayOfWeek(referenceDate),
  to: sundayOfWeek(referenceDate),
  projectId: "",
  collaboratorId: "",
}; }
export function ReportsPage() {
  const data = usePlanoriaData();
  const [tab, setTab] = useState<ReportTab>("reports");
  const [period, setPeriod] = useState<ReportPeriod>("week");
  const [filters, setFilters] = useState(() => weekFilters(data.referenceDate));
  const [notice, setNotice] = useState<string | null>(null);
  const [examined, setExamined] = useState<Task | null>(null);
  const [periodReference, setPeriodReference] = useState(data.referenceDate);
  if (periodReference !== data.referenceDate) {
    setPeriodReference(data.referenceDate);
    if (period === "today") setFilters((current) => ({ ...current, from: data.referenceDate, to: data.referenceDate }));
    if (period === "week") setFilters((current) => ({ ...current, from: mondayOfWeek(data.referenceDate), to: sundayOfWeek(data.referenceDate) }));
  }
  const tasks = useMemo(
    () => filterReportTasks(data, filters),
    [data, filters],
  );
  const choosePeriod = (value: ReportPeriod) => {
    setPeriod(value);
    if (value === "today")
      setFilters((f) => ({ ...f, from: data.referenceDate, to: data.referenceDate }));
    if (value === "week")
      setFilters((f) => ({ ...f, from: mondayOfWeek(data.referenceDate), to: sundayOfWeek(data.referenceDate) }));
  };
  return (
    <div className="min-h-dvh overflow-x-hidden bg-[#f7f9fb] text-[#142d4e]">
      <AdminSidebarWithModals
        activeItem="reports"
        taskCount={
          data.tasks.filter((t) => !["Terminée", "Validée"].includes(t.status))
            .length
        }
        onCreateTask={(values) => saveTaskForm(data, values, null)}
      />
      <div className="md:ml-[205px] min-[1201px]:ml-[232px]">
        <AdminTopBar
          currentPage="Suivi & rapports"
          notificationCount={
            data.tasks.filter((t) => t.status === "Bloquée").length
          }
          onNotifications={() =>
            setNotice(
              "Les tâches bloquées sont disponibles dans la Gestion des tâches.",
            )
          }
          onCollaborator={() =>
            setNotice(
              "L’espace collaborateur sera connecté dans une prochaine étape.",
            )
          }
        />
        <main className="mx-auto max-w-[1240px] px-4 py-8 sm:px-7 lg:px-8">
          <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <p className="text-[9px] font-bold tracking-[2px] text-[#536477]">
                VOTRE VUE D’ENSEMBLE
              </p>
              <h1 className="mt-3 text-[29px] font-bold tracking-[-1px]">
                Suivi & rapports
              </h1>
              <p className="mt-2 text-[11px] text-[#667486]">
                Comprendre les résultats. Décider avec clarté.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => exportPdf(data, tasks, filters)}
                className="flex min-h-10 items-center gap-2 rounded-md border border-[#dce4e7] bg-white px-4 text-[10px] font-semibold hover:bg-[#f6f8f8]"
              >
                <Download className="size-3.5" />
                Exporter
              </button>
              <button
                type="button"
                onClick={() =>
                  setNotice(
                    "Utilisez « Planifier une tâche » dans la sidebar pour ouvrir le formulaire partagé.",
                  )
                }
                className="flex min-h-10 items-center gap-2 rounded-md bg-[#08a17b] px-4 text-[10px] font-bold text-white hover:bg-[#078c6b]"
              >
                <Plus className="size-3.5" />
                Nouvelle tâche
              </button>
            </div>
          </header>
          <section className="mt-7 flex items-center justify-between rounded-md border border-[#d9ebe5] bg-[#eaf6f1] px-5 py-4 text-[10px] text-[#456a60]">
            <span className="flex items-center gap-2">
              <Sparkles className="size-4 text-[#08a17b]" />
              Des analyses pour éclairer vos décisions.
            </span>
            <span>L’assistant ne modifie aucune tâche.</span>
          </section>
          <div className="mt-4 flex flex-col gap-3 border-b border-[#dfe5e8] sm:flex-row sm:items-end sm:justify-between">
            <div className="flex" role="tablist" aria-label="Sections de suivi">
              {(
                [
                    ["reports", "Rapports", BarChart3],
                    ["history", "Historique", Clock3],
                    ["assistant", "Assistant", MessageCircle],
                ] as const
                ).map(([id, label, Icon]) => (
                <button
                  key={id}
                  role="tab"
                  aria-selected={tab === id}
                  onClick={() => setTab(id)}
                  className={`relative flex min-h-12 items-center gap-1.5 px-4 text-[11px] font-medium ${tab === id ? "text-[#078363] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-[#08a17b]" : "text-[#667486] hover:text-[#334b61]"}`}
                >
                  <Icon className="size-3.5 stroke-[1.8]" aria-hidden="true" />
                  {label}
                </button>
              ))}
            </div>
            <div className="flex gap-2 pb-2">
              <ExportButton
                label="PDF"
                icon={FileText}
                onClick={() => exportPdf(data, tasks, filters)}
              />
              <ExportButton
                label="Excel"
                icon={FileSpreadsheet}
                onClick={() => exportXlsx(data, tasks, filters)}
              />
              <ExportButton
                label="CSV"
                icon={Download}
                onClick={() => exportCsv(data, tasks, filters)}
              />
            </div>
          </div>
          <ReportFiltersBar
            filters={filters}
            period={period}
            projects={data.projects}
            collaborators={data.collaborators}
            onFilters={(value) => {
              setFilters(value);
              setPeriod("custom");
            }}
            onPeriod={choosePeriod}
          />
          <p className="mt-4 text-[10px] text-[#667486]">
            {tab === "history" ? "Événements" : "Tâches planifiées"} du{" "}
            {filters.from.split("-").reverse().join("/")} au{" "}
            {filters.to.split("-").reverse().join("/")} ·{" "}
            {tab === "history"
              ? "Horaires Africa/Douala"
              : "État actuel des tâches"}
          </p>
          {tab === "reports" ? (
            <ReportsView
              data={data}
              tasks={tasks}
              onAssistant={() => setTab("assistant")}
            />
          ) : tab === "history" ? (
            <HistoryView data={data} filters={filters} />
          ) : (
            <AssistantView data={data} tasks={tasks} filters={filters} period={period} onExamine={setExamined} />
          )}
          <p className="mt-8 text-[9px] leading-5 text-[#75828c]">
            Données synchronisées avec PostgreSQL. Le nombre de tâches ne
            mesure pas la qualité du travail. L’historique présenté reflète
            les événements enregistrés côté serveur.
          </p>
        </main>
        <footer className="border-t border-[#e6eaed] px-8 py-5 text-[9px] text-[#7a8691]">
          <span>Planoria · Votre organisation, une longueur d’avance.</span>
          <span className="float-right">
            Données synchronisées
          </span>
        </footer>
      </div>
      <Modal
        open={Boolean(notice)}
        onRequestClose={() => setNotice(null)}
        title="Information"
        size="sm"
      >
        <p className="text-sm text-[#536477]">{notice}</p>
      </Modal>
      <Modal
        open={Boolean(examined)}
        onRequestClose={() => setExamined(null)}
        title={examined?.title ?? "Tâche"}
        description="Consultation depuis l’assistant"
        size="sm"
      >
        <dl className="grid gap-3 text-sm">
          <div>
            <dt className="text-[10px] font-bold uppercase text-[#667486]">
              Statut
            </dt>
            <dd>{examined?.status}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase text-[#667486]">
              Priorité
            </dt>
            <dd>{examined?.priority}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase text-[#667486]">
              Description
            </dt>
            <dd>{examined?.description}</dd>
          </div>
        </dl>
      </Modal>
    </div>
  );
}
function ExportButton({
  label,
  icon: Icon,
  onClick,
}: {
  label: string;
  icon: typeof Download;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-8 items-center gap-2 rounded-md border border-[#dce4e7] bg-white px-3 text-[9px] font-semibold hover:bg-[#f6f8f8] focus-visible:outline-2 focus-visible:outline-[#059e79]"
    >
      <Icon className="size-3" />
      {label}
    </button>
  );
}
