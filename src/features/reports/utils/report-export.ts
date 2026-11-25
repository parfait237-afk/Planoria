import type { PlanoriaData, Task } from "@/features/tasks/types/task";
import type { ReportFilters } from "@/features/reports/types/report";
import { reportMetrics } from "@/features/reports/domain/report-rules";
import { formatCameroonInstant } from "@/lib/cameroon-date";

const safe = (value: unknown) => { const text = String(value ?? ""); return /^[=+\-@]/.test(text) ? `'${text}` : text; };
const download = (blob: Blob, name: string) => { const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = name; link.click(); URL.revokeObjectURL(url); };
function rows(data: PlanoriaData, tasks: Task[]) { return tasks.map((task) => ({ Tâche: task.title, Projet: data.projects.find((p) => p.id === task.projectId)?.name ?? "", Collaborateur: data.collaborators.find((p) => p.id === task.collaboratorId)?.name ?? "", Statut: task.status, Priorité: task.priority })); }

export function exportCsv(data: PlanoriaData, tasks: Task[], filters: ReportFilters) {
  const body = rows(data, tasks); const headers = Object.keys(body[0] ?? { Tâche: "", Projet: "", Collaborateur: "", Statut: "", Priorité: "" });
  const csv = [headers, ...body.map((row) => headers.map((key) => safe(row[key as keyof typeof row])))].map((line) => line.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(";")).join("\r\n");
  download(new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" }), `planoria-${filters.from}-${filters.to}.csv`);
}

export async function exportXlsx(data: PlanoriaData, tasks: Task[], filters: ReportFilters) {
  const XLSX = await import("xlsx"); const workbook = XLSX.utils.book_new(); const metrics = reportMetrics(tasks);
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(rows(data, tasks)), "Tâches"); XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet([{ ...metrics, "Généré le": formatCameroonInstant(data.referenceInstant) }]), "Synthèse");
  XLSX.writeFile(workbook, `planoria-${filters.from}-${filters.to}.xlsx`);
}

export async function exportPdf(data: PlanoriaData, tasks: Task[], filters: ReportFilters) {
  const { jsPDF } = await import("jspdf"); const pdf = new jsPDF(); const metrics = reportMetrics(tasks);
  pdf.setFontSize(18); pdf.text("Planoria — Suivi & rapports", 16, 18); pdf.setFontSize(10); pdf.text(`Période : ${filters.from} au ${filters.to}`, 16, 27); pdf.text(`Généré le : ${formatCameroonInstant(data.referenceInstant)}`, 16, 34); pdf.text(`Planifiées : ${metrics.planned}   Réalisées : ${metrics.completed}   Retards : ${metrics.late}   Taux : ${metrics.completionRate}%`, 16, 43);
  let y = 55; rows(data, tasks).forEach((row) => { if (y > 280) { pdf.addPage(); y = 18; } pdf.text(`${row.Tâche} — ${row.Collaborateur} — ${row.Statut}`, 16, y, { maxWidth: 178 }); y += 8; }); pdf.save(`planoria-${filters.from}-${filters.to}.pdf`);
}
