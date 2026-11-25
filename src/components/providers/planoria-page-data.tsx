import type { ReactNode } from "react";
import { connection } from "next/server";
import { loadPlanoriaData } from "@/db/queries/planoria-data";
import { PlanoriaDataProvider } from "@/store/planoria-store";
import { requireAdministrator } from "@/server/auth/session";
export async function PlanoriaPageData({ children }: { children: ReactNode }) { await connection(); await requireAdministrator(); const data = await loadPlanoriaData(); return <PlanoriaDataProvider initialData={data}>{children}</PlanoriaDataProvider>; }
