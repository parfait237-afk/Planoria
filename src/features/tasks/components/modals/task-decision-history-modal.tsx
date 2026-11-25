import { Modal } from "@/components/ui/modal";
import type { Task } from "@/features/tasks/types/task";

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#059e79]";
export function TaskDecisionHistoryModal({ open, task, onClose, onReopen }: { open: boolean; task?: Task; onClose: () => void; onReopen: (task: Task) => void }) {
  if (!task) return null;
  const history = task.validationHistory ?? [];
  return <Modal open={open} onRequestClose={onClose} title={task.status === "Validée" ? "Décision de validation" : "Historique des décisions"} description={task.title} size="md" footer={task.status === "Validée" ? <div className="flex justify-end"><button type="button" onClick={() => onReopen(task)} className={`rounded-lg border border-[#dfe5e9] px-4 py-2 text-xs font-semibold ${focus}`}>Rouvrir pour correction</button></div> : undefined}><div className="grid gap-3">{history.toReversed().map((decision) => <article key={decision.id} className="rounded-lg border border-[#e3e8ec] p-4"><div className="flex items-center justify-between gap-3"><strong className="text-xs">{decision.type === "validated" ? "Validation" : decision.type === "correction" ? "Correction demandée" : "Réouverture"}</strong><span className="text-[10px] text-[#7b8792]">{decision.date}</span></div><p className="mt-2 text-xs leading-5 text-[#536477]">{decision.reason}</p><small className="mt-2 block text-[10px] text-[#7b8792]">Par {decision.author}</small></article>)}{!history.length ? <p className="text-xs text-[#667486]">Aucune décision enregistrée.</p> : null}</div></Modal>;
}
