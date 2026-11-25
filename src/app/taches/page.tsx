import { TaskManagementPage } from "@/features/tasks/pages/task-management-page";
import { PlanoriaPageData } from "@/components/providers/planoria-page-data";

export default function TasksPage() {
  return <PlanoriaPageData><TaskManagementPage /></PlanoriaPageData>;
}
