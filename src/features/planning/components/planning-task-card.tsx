import { ArrowUpRight, Clock3, Flag } from "lucide-react";
import type { PlanoriaData, Task } from "@/features/tasks/types/task";
import { formatTaskDate } from "@/features/tasks/utils/task-dates";

export function PlanningTaskCard({ task, data, compact = false, onOpen }: { task: Task; data: PlanoriaData; compact?: boolean; onOpen: (task: Task) => void }) {
  const project = data.projects.find((entry) => entry.id === task.projectId);
  const person = data.collaborators.find((entry) => entry.id === task.collaboratorId);
  return <article className={`group rounded-lg border border-[#e4e9ed] bg-white ${compact ? "p-2.5" : "p-3.5"} shadow-[0_2px_8px_rgb(20_45_78_/_4%)]`}>
    <div className="flex items-start justify-between gap-2"><span className="rounded bg-[#edf7f3] px-2 py-1 text-[9px] font-medium text-[#497565]">{project?.name}</span><button type="button" aria-label={`Ouvrir ${task.title}`} onClick={() => onOpen(task)} className="rounded p-1 text-[#536477] hover:bg-[#f1f5f6] focus-visible:outline-2 focus-visible:outline-[#059e79]"><ArrowUpRight className="size-3.5" /></button></div>
    <button type="button" onClick={() => onOpen(task)} className="mt-2 block text-left text-[11px] font-semibold leading-5 text-[#243d54] focus-visible:outline-2 focus-visible:outline-[#059e79]">{task.title}</button>
    {!compact ? <div className="mt-3 flex items-center gap-3 text-[9px] text-[#6d7985]"><span className="flex items-center gap-1"><Flag className="size-3" />{task.priority}</span><span className="flex items-center gap-1"><Clock3 className="size-3" />{task.estimatedMinutes ? `${task.estimatedMinutes} min` : "Non estimée"}</span></div> : null}
    <div className="mt-3 flex items-center justify-between text-[9px] text-[#6d7985]"><span>{formatTaskDate(task.plannedDate, data.referenceDate)}</span><span className="grid size-6 place-items-center rounded-full bg-[#eef2f6] font-bold text-[#536477]" title={person?.name}>{person?.initials}</span></div>
  </article>;
}
