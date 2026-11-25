import { ChevronLeft, ChevronRight } from "lucide-react";
export function Pagination({ page, pageCount, onPageChange }: { page: number; pageCount: number; onPageChange: (page: number) => void }) {
  const control = "grid size-8 place-items-center rounded-lg border border-[#e1e6e9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#059e79] disabled:opacity-40";
  return <div className="flex items-center gap-3"><button type="button" disabled={page === 1} aria-label="Page précédente" onClick={() => onPageChange(Math.max(1, page - 1))} className={control}><ChevronLeft className="size-4" /></button><span>{page} / {pageCount}</span><button type="button" disabled={page === pageCount} aria-label="Page suivante" onClick={() => onPageChange(Math.min(pageCount, page + 1))} className={control}><ChevronRight className="size-4" /></button></div>;
}
