import type { CollaboratorFormValues } from "@/features/tasks/types/task";
import { replacePlanoriaData } from "@/store/planoria-store";
import { saveCollaboratorAction, saveInvitationDraftAction } from "@/app/actions/planoria-actions";

export async function saveCollaborator(values: CollaboratorFormValues, editingId?: string) {
  const response = await saveCollaboratorAction(values, editingId); replacePlanoriaData(response.data);
}

export async function saveInvitationDraft(collaboratorId: string, message: string) {
  const response = await saveInvitationDraftAction(collaboratorId, message); replacePlanoriaData(response.data);
}

