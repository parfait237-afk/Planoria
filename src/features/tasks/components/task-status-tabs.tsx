import type { TaskStatusFilter } from "@/features/tasks/hooks/use-task-management";
import type { Task } from "@/features/tasks/types/task";
import { isTaskOverdue } from "@/features/tasks/domain/task-rules";

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#059e79]";
export function TaskStatusTabs({ tasks, active, onChange }: { tasks: Task[]; active: TaskStatusFilter; onChange: (status: TaskStatusFilter) => void }) {
  const items: [TaskStatusFilter, string, number][] = [
    ["all", "Toutes", tasks.length], ["À faire", "À faire", tasks.filter((task) => task.status === "À faire").length],
    ["En cours", "En cours", tasks.filter((task) => task.status === "En cours").length], ["En pause", "En pause", tasks.filter((task) => task.status === "En pause").length],
    ["Bloquée", "Bloquée", tasks.filter((task) => task.status === "Bloquée").length], ["Terminée", "Terminée", tasks.filter((task) => task.status === "Terminée").length],
    ["Validée", "Validée", tasks.filter((task) => task.status === "Validée").length], ["En retard", "En retard", tasks.filter(isTaskOverdue).length],
  ];
  return <div className="flex overflow-x-auto border-b border-[#e7ebee] px-5" aria-label="Filtrer par statut">{items.map(([value, label, count]) => <button key={value} type="button" aria-pressed={active === value} onClick={() => onChange(value)} className={`flex min-h-14 shrink-0 items-center gap-2 border-b-2 px-3 text-[10px] ${focus} ${active === value ? "border-[#059e79] font-semibold text-[#078363]" : "border-transparent text-[#667486]"}`}>{label}<span className="rounded bg-[#eef2f4] px-1.5 py-0.5 text-[8px]">{count}</span></button>)}</div>;
}
