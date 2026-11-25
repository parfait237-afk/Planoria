import { RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import { TASK_PRIORITIES, TASK_STATUSES, type PlanoriaData } from "@/features/tasks/types/task";
import type { PlanningFilters } from "@/features/planning/types/planning";

const control = "h-10 min-w-0 rounded-lg border border-[#e2e8eb] bg-white px-3 text-[10px] text-[#536477] outline-none focus:border-[#55c5a8] focus:ring-2 focus:ring-[#ccefe5]";

export function PlanningFiltersBar({ data, filters, advancedOpen, onAdvanced, onChange, onReset }: { data: PlanoriaData; filters: PlanningFilters; advancedOpen: boolean; onAdvanced: () => void; onChange: <K extends keyof PlanningFilters>(key: K, value: PlanningFilters[K]) => void; onReset: () => void }) {
  const categories = Array.from(new Set(data.tasks.map((task) => task.category)));
  return <section className="rounded-[10px] border border-[#e4e9ed] bg-white p-3">
    <div className="grid gap-2 lg:grid-cols-[minmax(190px,1.6fr)_repeat(3,minmax(130px,.8fr))_auto_minmax(120px,.7fr)_auto]">
      <label className="relative"><Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#647586]" /><span className="sr-only">Rechercher</span><input className={`${control} w-full pl-10`} value={filters.query} onChange={(event) => onChange("query", event.target.value)} placeholder="Rechercher une tâche…" /></label>
      <Select value={filters.projectId} onChange={(value) => onChange("projectId", value)} options={[{ value: "all", label: "Tous les projets" }, ...data.projects.map((project) => ({ value: project.id, label: project.name }))]} />
      <Select value={filters.collaboratorId} onChange={(value) => onChange("collaboratorId", value)} options={[{ value: "all", label: "Tous les collaborateurs" }, ...data.collaborators.map((person) => ({ value: person.id, label: person.name }))]} />
      <Select value={filters.priority} onChange={(value) => onChange("priority", value as PlanningFilters["priority"])} options={[{ value: "all", label: "Toutes les priorités" }, ...TASK_PRIORITIES.map((value) => ({ value, label: value }))]} />
      <button type="button" aria-expanded={advancedOpen} onClick={onAdvanced} className={`${control} flex items-center justify-center gap-2 font-semibold hover:bg-[#f7faf9]`}><SlidersHorizontal className="size-3.5" />Filtres avancés</button>
      <Select value={filters.sort} onChange={(value) => onChange("sort", value as PlanningFilters["sort"])} options={[{ value: "urgency", label: "Par urgence" }, { value: "date", label: "Par date" }, { value: "project", label: "Par projet" }]} />
      <button type="button" aria-label="Réinitialiser le planning" onClick={onReset} className="grid size-10 place-items-center rounded-lg text-[#536477] hover:bg-[#f2f6f5] focus-visible:outline-2 focus-visible:outline-[#059e79]"><RotateCcw className="size-4" /></button>
    </div>
    {advancedOpen ? <div className="mt-3 grid gap-3 border-t border-[#edf0f2] pt-3 sm:grid-cols-2 lg:grid-cols-4">
      <label className="grid gap-1 text-[9px] text-[#697785]">Statut<Select value={filters.status} onChange={(value) => onChange("status", value as PlanningFilters["status"])} options={[{ value: "all", label: "Tous les statuts" }, ...TASK_STATUSES.map((value) => ({ value, label: value }))]} /></label>
      <label className="grid gap-1 text-[9px] text-[#697785]">Catégorie<Select value={filters.category} onChange={(value) => onChange("category", value)} options={[{ value: "all", label: "Toutes les catégories" }, ...categories.map((value) => ({ value, label: value }))]} /></label>
      <label className="grid gap-1 text-[9px] text-[#697785]">Planifié du<input type="date" className={control} value={filters.dateFrom} onChange={(event) => onChange("dateFrom", event.target.value)} /></label>
      <label className="grid gap-1 text-[9px] text-[#697785]">Au<input type="date" className={control} value={filters.dateTo} onChange={(event) => onChange("dateTo", event.target.value)} /></label>
    </div> : null}
  </section>;
}

function Select({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: { value: string; label: string }[] }) { return <select className={`${control} w-full`} value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>; }

