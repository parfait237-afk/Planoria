import type { ReactNode } from "react";
export function Badge({ children, tone = "neutral", className = "" }: { children: ReactNode; tone?: "neutral" | "success" | "warning" | "danger" | "info"; className?: string }) {
  const tones = { neutral: "bg-[#f2f4f6] text-[#667486]", success: "bg-[#eaf6f1] text-[#078363]", warning: "bg-[#fff3e8] text-[#9a622f]", danger: "bg-[#fff0ed] text-[#b95749]", info: "bg-[#edf3f7] text-[#31566f]" } as const;
  return <span className={`inline-flex rounded px-2 py-1 text-[10px] font-medium ${tones[tone]} ${className}`}>{children}</span>;
}
