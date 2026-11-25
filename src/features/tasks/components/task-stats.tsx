import { CheckCircle2, Clock3, FileCheck2, Folder, ListTodo, TriangleAlert, type LucideIcon } from "lucide-react";
import type { Task } from "@/features/tasks/types/task";
import { isTaskOverdue } from "@/features/tasks/domain/task-rules";

type Stat = { label: string; value: number; icon: LucideIcon; tone: string };
export function TaskStats({ tasks }: { tasks: Task[] }) {
  const stats: Stat[] = [
    { label: "Tâches au total", value: tasks.length, icon: Folder, tone: "bg-[#edf3f7] text-[#31566f]" },
    { label: "En cours", value: tasks.filter((task) => task.status === "En cours").length, icon: Clock3, tone: "bg-[#edf3f7] text-[#31566f]" },
    { label: "Urgentes", value: tasks.filter((task) => task.priority === "Urgente").length, icon: ListTodo, tone: "bg-[#fff4e9] text-[#9d6a35]" },
    { label: "En retard", value: tasks.filter(isTaskOverdue).length, icon: TriangleAlert, tone: "bg-[#fff0ed] text-[#c05f50]" },
    { label: "Terminées, à contrôler", value: tasks.filter((task) => task.status === "Terminée").length, icon: FileCheck2, tone: "bg-[#fff4e9] text-[#9d6a35]" },
    { label: "Validées", value: tasks.filter((task) => task.status === "Validée").length, icon: CheckCircle2, tone: "bg-[#eaf6f1] text-[#078363]" },
  ];
  return <section aria-label="Indicateurs des tâches" className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">{stats.map(({ label, value, icon: Icon, tone }) => <article key={label} className="flex min-h-28 items-center gap-3 rounded-[10px] border border-[#e3e8ec] bg-white p-4"><span className={`grid size-9 shrink-0 place-items-center rounded-lg ${tone}`}><Icon className="size-4" /></span><span><small className="block text-[10px] leading-4 text-[#667486]">{label}</small><strong className="mt-1 block text-2xl">{value}</strong></span></article>)}</section>;
}
