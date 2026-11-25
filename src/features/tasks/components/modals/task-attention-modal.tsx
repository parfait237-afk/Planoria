import { Modal } from "@/components/ui/modal";
import type { PlanoriaData, Task } from "@/features/tasks/types/task";
import { getTaskRelations, isTaskOverdue } from "@/features/tasks/domain/task-rules";

export function TaskAttentionModal({ open, onClose, tasks, data }: { open: boolean; onClose: () => void; tasks: Task[]; data: PlanoriaData }) {
  return <Modal open={open} onRequestClose={onClose} title="Votre attention est requise" size="sm"><div className="grid gap-4">{tasks.map((task) => { const relation = getTaskRelations(data, task); return <article key={task.id}><strong className="text-xs">{task.title}</strong><p className="mt-1 text-[11px] text-[#667486]">{relation.collaborator?.name} · {isTaskOverdue(task) ? "En retard" : task.status}</p></article>; })}{!tasks.length ? <p className="text-xs text-[#667486]">Aucune alerte actuellement.</p> : null}</div></Modal>;
}
