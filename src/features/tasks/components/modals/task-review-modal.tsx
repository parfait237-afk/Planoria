"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import type { PlanoriaData, Task } from "@/features/tasks/types/task";
import { getTaskRelations } from "@/features/tasks/domain/task-rules";
import { recordReviewDecision } from "@/features/tasks/services/task-actions";

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#059e79]";
export function TaskReviewModal({ open, task, data, onClose }: { open: boolean; task?: Task; data: PlanoriaData; onClose: () => void }) {
  const [action, setAction] = useState<"validated" | "correction">("validated");
  const [reason, setReason] = useState("");
  if (!task) return null;
  const relation = getTaskRelations(data, task);
  const close = () => { setReason(""); setAction("validated"); onClose(); };
  const submit = async () => {
    if (!reason.trim()) return;
    await recordReviewDecision(task, action, reason);
    close();
  };
  return <Modal open={open} onRequestClose={close} title="Contrôler la réalisation" description={`${task.title} · ${relation.collaborator?.name}`} size="md" footer={<div className="flex justify-end gap-2"><button type="button" onClick={close} className={`rounded-lg border border-[#dfe5e9] px-4 py-2 text-xs ${focus}`}>Annuler</button><button type="button" disabled={!reason.trim()} onClick={submit} className={`rounded-lg bg-[#059e79] px-4 py-2 text-xs font-semibold text-white disabled:opacity-40 ${focus}`}>Enregistrer la décision</button></div>}><fieldset><legend className="text-xs font-bold">Décision</legend><div className="mt-3 flex gap-3"><label className="flex items-center gap-2 text-xs"><input type="radio" name="decision" checked={action === "validated"} onChange={() => setAction("validated")} className="accent-[#059e79]" />Valider</label><label className="flex items-center gap-2 text-xs"><input type="radio" name="decision" checked={action === "correction"} onChange={() => setAction("correction")} className="accent-[#059e79]" />Demander une correction</label></div></fieldset><label className="mt-5 block text-xs font-medium">Motif <span className="text-[#a45b49]">*</span><textarea value={reason} onChange={(event) => setReason(event.target.value)} required className={`mt-2 min-h-28 w-full rounded-lg border border-[#dfe5e9] p-3 text-xs outline-none ${focus}`} placeholder={action === "validated" ? "Précisez les éléments validés..." : "Décrivez les corrections attendues..."} /></label></Modal>;
}
