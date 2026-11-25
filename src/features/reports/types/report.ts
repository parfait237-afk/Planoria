export type ReportTab = "reports" | "history" | "assistant";
export type ReportPeriod = "today" | "week" | "custom";
export type ReportFilters = { from: string; to: string; projectId: string; collaboratorId: string };
export type ReportMetric = { planned: number; completed: number; validated: number; late: number; completionRate: number };
