import { DashboardPage } from "@/features/dashboard/pages/dashboard-page";
import { PlanoriaPageData } from "@/components/providers/planoria-page-data";

export default function Home() {
  return <PlanoriaPageData><DashboardPage /></PlanoriaPageData>;
}
