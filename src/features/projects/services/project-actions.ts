import type { PlanoriaData, ProjectFormValues } from "@/features/tasks/types/task";
import { replacePlanoriaData } from "@/store/planoria-store";
import { saveProjectAction } from "@/app/actions/planoria-actions";

export async function saveProject(_data: PlanoriaData, values: ProjectFormValues, editingId?: string) {
  const response = await saveProjectAction(values, editingId); replacePlanoriaData(response.data);
}

