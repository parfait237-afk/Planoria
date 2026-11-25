import type { TaskStatus } from "@/features/tasks/types/task";
import { replacePlanoriaData } from "@/store/planoria-store";
import { moveTaskAction } from "@/app/actions/planoria-actions";

export async function movePlanningTask(taskId: string, status: TaskStatus) {
  const response = await moveTaskAction(taskId, status); replacePlanoriaData(response.data);
}

